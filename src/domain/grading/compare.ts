import type { ResultSet } from "../exercise/types";

/**
 * セル値を比較用の文字列キーに正規化する。
 * - 型の違い（1 と "1"、NULL と ""）は区別する
 * - bigint と同値の number は同一視する（SQLite の int64 境界による型ゆれを吸収）
 * - BLOB（Uint8Array）はバイト列で比較する
 */
const normalizeCell = (value: unknown): string => {
  if (value === null || value === undefined) return "null";
  if (typeof value === "number") return `n:${value}`;
  if (typeof value === "bigint") return `n:${value.toString()}`;
  if (typeof value === "string") return `s:${value}`;
  if (value instanceof Uint8Array) return `b:${Array.from(value).join(",")}`;
  return `o:${JSON.stringify(value)}`;
};

const normalizeRow = (row: unknown[]): string => JSON.stringify(row.map(normalizeCell));

/**
 * ResultSet を比較して採点する（企画書 §8）。
 * 列名は比較しない（`u.name` と `name AS user_name` を同一視するため）。
 * 列の並び・各セルの値・行数（重複を含む）を比較し、orderMatters=false なら行順を正規化する。
 */
export const compareResultSets = (
  actual: ResultSet,
  expected: ResultSet,
  orderMatters: boolean,
): boolean => {
  if (actual.rows.length !== expected.rows.length) return false;
  if (actual.rows.length === 0) return true;
  if (actual.columns.length !== expected.columns.length) return false;

  const actualRows = actual.rows.map(normalizeRow);
  const expectedRows = expected.rows.map(normalizeRow);
  if (!orderMatters) {
    actualRows.sort();
    expectedRows.sort();
  }
  return actualRows.every((row, index) => row === expectedRows[index]);
};
