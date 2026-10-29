import type { ResultSet } from "../exercise/types";

const isTruthyCell = (value: unknown): boolean => {
  if (typeof value === "bigint") return value !== 0n;
  if (typeof value === "string") return value !== "" && value !== "0";
  return Boolean(value);
};

/**
 * mutation 問題の判定（企画書 §9）。
 * verifySql の結果が 1 行以上あり、全行の先頭列が真なら正解。
 */
export const isVerifyPassed = (verifyResult: ResultSet): boolean =>
  verifyResult.rows.length > 0 && verifyResult.rows.every((row) => isTruthyCell(row[0]));
