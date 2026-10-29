/**
 * Worker 内で 1 Run を実行する純関数。worker.ts はこれを onmessage に配線するだけ。
 * Node（Vitest）でも実 SQLite で検証できるよう、Worker API には依存しない。
 */

import {
  type ExecuteRequest,
  type ExecuteResponse,
  MAX_RESULT_ROWS,
  type ResultSet,
} from "../domain/exercise/types";
import { compareResultSets } from "../domain/grading/compare";
import { isVerifyPassed } from "../domain/grading/mutation";
import { createDatabase, getSqliteVersion, type SqlDatabase } from "./database";

const truncate = (resultSet: ResultSet): ResultSet => ({
  columns: resultSet.columns,
  rows: resultSet.rows.slice(0, MAX_RESULT_ROWS),
});

const isTruncated = (resultSet: ResultSet): boolean => resultSet.rows.length > MAX_RESULT_ROWS;

/** setupSql を流した新品の :memory: DB で fn を実行し、必ず破棄する（企画書 §5） */
const withFreshDatabase = async <T>(setupSql: string, fn: (db: SqlDatabase) => T): Promise<T> => {
  const db = await createDatabase();
  try {
    db.execute(setupSql);
    return fn(db);
  } finally {
    db.close();
  }
};

/** ユーザー SQL だけを計測して実行する */
const executeTimed = (db: SqlDatabase, sql: string): { result: ResultSet; durationMs: number } => {
  const startedAt = performance.now();
  const result = db.execute(sql);
  return { result, durationMs: performance.now() - startedAt };
};

/** WASM モジュールを先読みする。初回 Run のタイムアウトに初期化コストを含めないために使う */
export const warmup = async (): Promise<void> => {
  await getSqliteVersion();
};

export const executeRequest = async (request: ExecuteRequest): Promise<ExecuteResponse> => {
  const { requestId, setupSql, userSql, grading } = request;

  try {
    if (grading.kind === "query") {
      // practice DB（ユーザー SQL）と reference DB（solutionSql）は独立させる（企画書 §8）
      const { result, durationMs } = await withFreshDatabase(setupSql, (db) =>
        executeTimed(db, userSql),
      );
      const expected = await withFreshDatabase(setupSql, (db) => db.execute(grading.solutionSql));
      return {
        type: "result",
        requestId,
        result: truncate(result),
        truncated: isTruncated(result),
        expected: truncate(expected),
        expectedTruncated: isTruncated(expected),
        correct: compareResultSets(result, expected, grading.orderMatters),
        durationMs,
      };
    }

    // mutation: ユーザー SQL 実行後の practice DB に verifySql を流す（企画書 §9）
    const { result, durationMs, verified } = await withFreshDatabase(setupSql, (db) => ({
      ...executeTimed(db, userSql),
      verified: db.execute(grading.verifySql),
    }));
    return {
      type: "result",
      requestId,
      result: truncate(result),
      truncated: isTruncated(result),
      correct: isVerifyPassed(verified),
      durationMs,
    };
  } catch (error) {
    return {
      type: "error",
      requestId,
      message: error instanceof Error ? error.message : String(error),
    };
  }
};
