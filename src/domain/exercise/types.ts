/**
 * 問題定義（企画書 §7）。
 * 問題はコードではなくデータとして追加する。SQLite 実装には依存しない。
 */
export type ExerciseType = "query" | "mutation";

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export type Exercise = {
  id: string;
  title: string;
  prompt: string;
  datasetId: string;
  difficulty: Difficulty;
  /** 先頭要素をカテゴリとして扱う（例: "JOIN"） */
  tags: string[];
  type: ExerciseType;
  /**
   * query 問題: この SQL の ResultSet と比較して採点する（必須）。
   * mutation 問題: 模範解答。採点には使わず、テストで verifySql が真になることの検証に使う。
   */
  solutionSql?: string;
  /** mutation 問題: ユーザー SQL 実行後にこの SQL を実行し、全行の先頭列が真なら正解 */
  verifySql?: string;
  /** true のとき行順も比較する（ORDER BY 自体が問題の目的の場合） */
  orderMatters?: boolean;
  hints?: string[];
};

/**
 * SQL 実行結果。SQLite 実装に依存しない（企画書 §8 の比較対象）。
 */
export type ResultSet = {
  columns: string[];
  rows: unknown[][];
};

/**
 * 採点方法。Worker は Exercise を知らず、この情報だけで採点する。
 */
export type Grading =
  | { kind: "query"; solutionSql: string; orderMatters: boolean }
  | { kind: "mutation"; verifySql: string };

/**
 * UI ⇄ SQLite Worker 間のメッセージ（企画書 §10）。
 * Worker は「SQL の束」だけを受け取り、問題データや Dataset には依存しない。
 */
export type ExecuteRequest = {
  type: "execute";
  requestId: number;
  /** schema.sql + seed.sql。Run ごとに新品の :memory: DB へ流す */
  setupSql: string;
  userSql: string;
  grading: Grading;
};

/** WASM の初期化を先に済ませておく（初回 Run のタイムアウトに含めないため） */
export type WarmupRequest = {
  type: "warmup";
  requestId: number;
};

export type WorkerRequest = ExecuteRequest | WarmupRequest;

export type ExecuteResponse =
  | {
      type: "result";
      requestId: number;
      /** ユーザー SQL の結果（表示用。MAX_RESULT_ROWS で打ち切り） */
      result: ResultSet;
      /** result が MAX_RESULT_ROWS で打ち切られたか */
      truncated: boolean;
      /** query 問題のみ。solutionSql の結果（不正解時の参考表示用） */
      expected?: ResultSet;
      expectedTruncated?: boolean;
      correct: boolean;
      /** ユーザー SQL 自体の実行時間（DB 生成・seed 投入・採点は含まない） */
      durationMs: number;
    }
  | {
      type: "error";
      requestId: number;
      message: string;
    };

export type WorkerResponse = ExecuteResponse | { type: "ready"; requestId: number };

/** UI へ返す ResultSet の最大行数（企画書 §11） */
export const MAX_RESULT_ROWS = 500;

export const toGrading = (exercise: Exercise): Grading => {
  if (exercise.type === "mutation") {
    if (!exercise.verifySql) {
      throw new Error(`mutation 問題 ${exercise.id} に verifySql がありません`);
    }
    return { kind: "mutation", verifySql: exercise.verifySql };
  }
  if (!exercise.solutionSql) {
    throw new Error(`query 問題 ${exercise.id} に solutionSql がありません`);
  }
  return {
    kind: "query",
    solutionSql: exercise.solutionSql,
    orderMatters: exercise.orderMatters ?? false,
  };
};
