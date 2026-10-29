import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { ExercisePanel } from "../components/ExercisePanel/ExercisePanel";
import { Progress } from "../components/Progress/Progress";
import { ResultTable } from "../components/ResultTable/ResultTable";
import { SchemaViewer } from "../components/SchemaViewer/SchemaViewer";
import { SqlEditor } from "../components/SqlEditor/SqlEditor";
import { findDataset } from "../datasets";
import { toSetupSql } from "../domain/dataset/types";
import {
  ALL_CATEGORIES,
  filterByCategory,
  listCategories,
  pickNext,
} from "../domain/exercise/select";
import { type ExecuteResponse, type Exercise, toGrading } from "../domain/exercise/types";
import { exercises } from "../exercises";
import { createSqlRunner, DEFAULT_TIMEOUT_MS } from "../sqlite/client";
import {
  loadProgress,
  type Progress as ProgressData,
  recordAttempt,
  saveProgress,
} from "../storage/progress";
import "./App.css";

type RunState =
  | { status: "idle" }
  | { status: "running" }
  | {
      status: "done";
      response: ExecuteResponse;
      exerciseId: string;
      /** 実行時点の SQL。編集されたら「正解直後の Mod-Enter = 次へ」を解除する */
      sql: string;
    };

type State = {
  category: string;
  exerciseId: string | undefined;
  sql: string;
  run: RunState;
  progress: ProgressData;
};

type Action =
  | { type: "selectCategory"; category: string }
  | { type: "setSql"; sql: string }
  | { type: "runStarted" }
  | { type: "runFinished"; response: ExecuteResponse; exerciseId: string; sql: string }
  | { type: "goTo"; exerciseId: string | undefined }
  | { type: "reset" };

const categories = listCategories(exercises);

const listFor = (category: string): Exercise[] => filterByCategory(exercises, category);

const solvedIdsOf = (progress: ProgressData): Set<string> => new Set(Object.keys(progress.solved));

const initialState = (): State => {
  const progress = loadProgress();
  const category = categories.includes(progress.category) ? progress.category : ALL_CATEGORIES;
  const list = listFor(category);
  const last = list.find((e) => e.id === progress.lastExerciseId);
  const exerciseId = (last ?? pickNext(list, undefined, solvedIdsOf(progress)))?.id;
  return { category, exerciseId, sql: "", run: { status: "idle" }, progress };
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "selectCategory": {
      const list = listFor(action.category);
      const stillThere = list.some((e) => e.id === state.exerciseId);
      const exerciseId = stillThere
        ? state.exerciseId
        : pickNext(list, undefined, solvedIdsOf(state.progress))?.id;
      return {
        ...state,
        category: action.category,
        exerciseId,
        sql: stillThere ? state.sql : "",
        run: stillThere ? state.run : { status: "idle" },
        progress: { ...state.progress, category: action.category, lastExerciseId: exerciseId },
      };
    }
    case "setSql":
      return { ...state, sql: action.sql };
    case "runStarted":
      return { ...state, run: { status: "running" } };
    case "runFinished": {
      const progress =
        action.response.type === "result"
          ? recordAttempt(state.progress, action.exerciseId, action.response.correct)
          : state.progress;
      return {
        ...state,
        run: {
          status: "done",
          response: action.response,
          exerciseId: action.exerciseId,
          sql: action.sql,
        },
        progress,
      };
    }
    case "goTo":
      return {
        ...state,
        exerciseId: action.exerciseId,
        sql: "",
        run: { status: "idle" },
        progress: { ...state.progress, lastExerciseId: action.exerciseId },
      };
    case "reset":
      return { ...state, sql: "", run: { status: "idle" } };
  }
};

const RunStatus = ({
  run,
  exerciseId,
  readyForNext,
}: {
  run: RunState;
  exerciseId: string | undefined;
  readyForNext: boolean;
}) => {
  if (run.status === "idle") {
    return <p className="run-status run-status--idle">SQL を書いて ⌘/Ctrl + Enter で実行</p>;
  }
  if (run.status === "running") {
    return <p className="run-status run-status--running">実行中…</p>;
  }
  if (run.exerciseId !== exerciseId) return null;
  const { response } = run;
  if (response.type === "error") {
    return (
      <p className="run-status run-status--error" role="alert">
        ⚠️ Error: {response.message}
      </p>
    );
  }
  return response.correct ? (
    <p className="run-status run-status--correct">
      ✅ Correct{" "}
      <small>
        （SQL 実行 {formatDuration(response.durationMs)}）
        {readyForNext ? " — ⌘/Ctrl + Enter で次の問題" : " — 書き直した SQL を再実行できます"}
      </small>
    </p>
  ) : (
    <p className="run-status run-status--incorrect">
      ❌ Incorrect <small>（SQL 実行 {formatDuration(response.durationMs)}）</small>
    </p>
  );
};

const formatDuration = (ms: number): string => (ms < 1 ? "<1 ms" : `${Math.round(ms)} ms`);

export const App = () => {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const runnerRef = useRef<ReturnType<typeof createSqlRunner>>(null);
  const editorHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const runner = createSqlRunner({ timeoutMs: DEFAULT_TIMEOUT_MS });
    runnerRef.current = runner;
    return () => {
      runner.dispose();
      runnerRef.current = null;
    };
  }, []);

  useEffect(() => {
    saveProgress(state.progress);
  }, [state.progress]);

  const list = useMemo(() => listFor(state.category), [state.category]);
  const exercise = list.find((e) => e.id === state.exerciseId);
  const solvedIds = solvedIdsOf(state.progress);
  const solvedInList = list.filter((e) => solvedIds.has(e.id)).length;
  const dataset = exercise ? findDataset(exercise.datasetId) : undefined;

  const lastResponse =
    state.run.status === "done" && state.run.exerciseId === exercise?.id
      ? state.run.response
      : undefined;
  const isCorrect = lastResponse?.type === "result" && lastResponse.correct;
  // 正解した SQL をそのまま保持している間だけ「Mod-Enter = 次へ」。書き直したら再実行に戻す
  const readyForNext = isCorrect && state.run.status === "done" && state.run.sql === state.sql;

  const goNext = useCallback(() => {
    if (!exercise) return;
    dispatch({ type: "goTo", exerciseId: pickNext(list, exercise.id, solvedIds)?.id });
    editorHostRef.current?.querySelector<HTMLElement>(".cm-content")?.focus();
  }, [exercise, list, solvedIds]);

  const run = useCallback(async () => {
    const runner = runnerRef.current;
    if (!runner || !exercise || !dataset || state.run.status === "running") return;
    const sql = state.sql;
    if (sql.trim() === "") return;
    // 問題データの不備（solutionSql 欠落など）は実行前に検出し、エラーとして表示する
    let request: Parameters<typeof runner.run>[0];
    try {
      request = { setupSql: toSetupSql(dataset), userSql: sql, grading: toGrading(exercise) };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      dispatch({
        type: "runFinished",
        response: { type: "error", requestId: -1, message },
        exerciseId: exercise.id,
        sql,
      });
      return;
    }
    dispatch({ type: "runStarted" });
    const response = await runner.run(request);
    dispatch({ type: "runFinished", response, exerciseId: exercise.id, sql });
  }, [exercise, dataset, state.run.status, state.sql]);

  // Mod-Enter: 正解直後なら次の問題、それ以外は実行
  const onRunShortcut = useCallback(() => {
    if (readyForNext) goNext();
    else void run();
  }, [readyForNext, goNext, run]);

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">SQL Reflex</h1>
        <label className="app__category">
          カテゴリ
          <select
            value={state.category}
            onChange={(e) => dispatch({ type: "selectCategory", category: e.target.value })}
          >
            <option value={ALL_CATEGORIES}>すべて</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <Progress
          solvedCount={solvedInList}
          totalCount={list.length}
          streak={state.progress.streak}
        />
      </header>

      {!exercise || !dataset ? (
        <main className="app__empty">このカテゴリには問題がありません。</main>
      ) : (
        <main className="app__main">
          <aside className="app__side">
            <ExercisePanel exercise={exercise} solved={solvedIds.has(exercise.id)} />
            <section className="app__schema">
              <h3>Schema: {dataset.name}</h3>
              <SchemaViewer schemaSql={dataset.schemaSql} />
            </section>
          </aside>

          <section className="app__work">
            <div className="app__editor" ref={editorHostRef}>
              <SqlEditor
                value={state.sql}
                onChange={(sql) => dispatch({ type: "setSql", sql })}
                onRun={onRunShortcut}
              />
            </div>
            <div className="app__toolbar">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => void run()}
                disabled={state.run.status === "running" || state.sql.trim() === ""}
              >
                Run <kbd>⌘⏎</kbd>
              </button>
              <button type="button" className="btn" onClick={() => dispatch({ type: "reset" })}>
                Reset
              </button>
              <button type="button" className="btn" onClick={goNext}>
                {readyForNext ? "Next →" : "Skip →"}
              </button>
            </div>

            <RunStatus run={state.run} exerciseId={exercise.id} readyForNext={readyForNext} />

            {lastResponse?.type === "result" && (
              <div className="app__results">
                <ResultTable
                  result={lastResponse.result}
                  truncated={lastResponse.truncated}
                  caption="あなたの結果"
                />
                {!lastResponse.correct && lastResponse.expected && (
                  <ResultTable
                    result={lastResponse.expected}
                    truncated={lastResponse.expectedTruncated}
                    caption="期待される結果"
                  />
                )}
              </div>
            )}
          </section>
        </main>
      )}
    </div>
  );
};
