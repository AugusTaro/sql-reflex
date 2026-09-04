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
  tags: string[];
  type: ExerciseType;
  /** query 問題: この SQL の ResultSet と比較して採点する */
  solutionSql?: string;
  /** mutation 問題: ユーザー SQL 実行後にこの SQL を実行して判定する */
  verifySql?: string;
  /** true のとき行順も比較する（ORDER BY 自体が問題の目的の場合） */
  orderMatters?: boolean;
  hints?: string[];
};

/**
 * UI ⇄ SQLite Worker 間のメッセージ（企画書 §10）。
 */
export type WorkerRequest = {
  type: "execute";
  exerciseId: string;
  sql: string;
};

export type WorkerResponse =
  | {
      type: "result";
      columns: string[];
      rows: unknown[][];
      correct: boolean;
      durationMs: number;
    }
  | {
      type: "error";
      message: string;
    };
