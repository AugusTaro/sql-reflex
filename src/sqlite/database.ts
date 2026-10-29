/**
 * SQLite WASM の薄いラッパー。SQLite への依存はこのディレクトリに閉じ込める（企画書 §19）。
 * DOM に依存しないため UI スレッド・Web Worker のどちらからでも利用できる。
 * 旧 Worker1 / Promiser API は使わず、OO1 API（sqlite3.oo1.DB）を直接使う（企画書 §10）。
 */
import sqlite3InitModule, { type Sqlite3Static, type SqlValue } from "@sqlite.org/sqlite-wasm";
import type { ResultSet } from "../domain/exercise/types";

export type SqlDatabase = {
  /**
   * SQL を実行し ResultSet を返す。複数ステートメント可。
   * 結果は「最初に結果列を持つ文」のもののみ（sqlite-wasm の exec 仕様）。
   * 結果列を持たない DDL / DML は columns / rows ともに空になる。
   * SQL エラーは SQLite3Error（Error のサブクラス）がそのまま throw される。
   */
  execute: (sql: string) => ResultSet;
  close: () => void;
};

// WASM モジュールの初期化は重いので 1 プロセスで 1 回だけ行う。
// 失敗した Promise はキャッシュから外し、次回呼び出しで再試行できるようにする。
let sqlite3Promise: Promise<Sqlite3Static> | undefined;
const loadSqlite3 = (): Promise<Sqlite3Static> => {
  sqlite3Promise ??= sqlite3InitModule().catch((error: unknown) => {
    sqlite3Promise = undefined;
    throw error;
  });
  return sqlite3Promise;
};

export const getSqliteVersion = async (): Promise<string> =>
  (await loadSqlite3()).version.libVersion;

/**
 * 新品の `:memory:` DB を作る。
 * 呼び出し側が Run 単位で create → execute → close する（企画書 §5: DB を使い回さない）。
 */
export const createDatabase = async (): Promise<SqlDatabase> => {
  const sqlite3 = await loadSqlite3();
  const db = new sqlite3.oo1.DB(":memory:");

  return {
    execute: (sql) => {
      const columns: string[] = [];
      const rows: SqlValue[][] = [];
      db.exec({ sql, rowMode: "array", columnNames: columns, resultRows: rows });
      // SqlValue[][] は unknown[][] に代入可能。ドメイン型に SQLite 固有の型を漏らさない
      return { columns, rows };
    },
    close: () => db.close(),
  };
};
