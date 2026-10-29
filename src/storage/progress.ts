/**
 * 学習進捗の保存（企画書 §12）。localStorage にのみ保存し、SQLite DB は保存しない。
 * 純関数 + 注入可能な storage にしてテスト可能にしている。
 */
import { ALL_CATEGORIES } from "../domain/exercise/select";

const STORAGE_KEY = "sql-reflex:progress:v1";

export type ProgressStorage = Pick<Storage, "getItem" | "setItem">;

export type Progress = {
  /** 正解済みの問題。最初に正解した時刻と累計試行回数 */
  solved: Record<string, { solvedAt: string; attempts: number }>;
  /** 未正解の問題の試行回数 */
  attempts: Record<string, number>;
  /** 連続正解数 */
  streak: number;
  lastExerciseId?: string;
  category: string;
};

export const createInitialProgress = (): Progress => ({
  solved: {},
  attempts: {},
  streak: 0,
  category: ALL_CATEGORIES,
});

export const recordAttempt = (
  progress: Progress,
  exerciseId: string,
  correct: boolean,
  now: string = new Date().toISOString(),
): Progress => {
  const previousAttempts =
    progress.solved[exerciseId]?.attempts ?? progress.attempts[exerciseId] ?? 0;
  const attempts = previousAttempts + 1;

  if (!correct) {
    return { ...progress, streak: 0, attempts: { ...progress.attempts, [exerciseId]: attempts } };
  }

  const { [exerciseId]: _, ...restAttempts } = progress.attempts;
  return {
    ...progress,
    streak: progress.streak + 1,
    attempts: restAttempts,
    solved: {
      ...progress.solved,
      [exerciseId]: { solvedAt: progress.solved[exerciseId]?.solvedAt ?? now, attempts },
    },
  };
};

const defaultStorage = (): ProgressStorage | undefined =>
  typeof localStorage === "undefined" ? undefined : localStorage;

const isProgress = (value: unknown): value is Progress =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as Progress).solved === "object" &&
  typeof (value as Progress).streak === "number";

export const loadProgress = (storage = defaultStorage()): Progress => {
  const initial = createInitialProgress();
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return initial;
    const parsed: unknown = JSON.parse(raw);
    return isProgress(parsed) ? { ...initial, ...parsed } : initial;
  } catch {
    return initial;
  }
};

export const saveProgress = (progress: Progress, storage = defaultStorage()): void => {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // localStorage が使えない環境（プライベートモード等）では保存を諦める
  }
};
