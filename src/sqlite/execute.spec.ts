import { describe, expect, it } from "vitest";
import { type ExecuteRequest, MAX_RESULT_ROWS } from "../domain/exercise/types";
import { executeRequest } from "./execute";

const setupSql = `
  CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
  INSERT INTO users (name) VALUES ('Alice'), ('Bob'), ('Chika');
`;

const queryRequest = (userSql: string, orderMatters = false): ExecuteRequest => ({
  type: "execute",
  requestId: 1,
  setupSql,
  userSql,
  grading: { kind: "query", solutionSql: "SELECT name FROM users ORDER BY id", orderMatters },
});

describe("executeRequest (query)", () => {
  it("正解 SQL は correct=true で結果と期待結果を返す", async () => {
    const res = await executeRequest(queryRequest("SELECT name FROM users"));
    expect(res.type).toBe("result");
    if (res.type !== "result") return;
    expect(res.correct).toBe(true);
    expect(res.result.rows).toEqual([["Alice"], ["Bob"], ["Chika"]]);
    expect(res.expected?.rows).toEqual([["Alice"], ["Bob"], ["Chika"]]);
    expect(res.truncated).toBe(false);
    expect(res.durationMs).toBeGreaterThanOrEqual(0);
    expect(res.requestId).toBe(1);
  });

  it("結果が違えば correct=false", async () => {
    const res = await executeRequest(queryRequest("SELECT name FROM users WHERE id = 1"));
    if (res.type !== "result") throw new Error("unexpected");
    expect(res.correct).toBe(false);
  });

  it("orderMatters=true なら順序違いは不正解", async () => {
    const res = await executeRequest(queryRequest("SELECT name FROM users ORDER BY id DESC", true));
    if (res.type !== "result") throw new Error("unexpected");
    expect(res.correct).toBe(false);
  });

  it("構文エラーは type=error で message を返す", async () => {
    const res = await executeRequest(queryRequest("SELEC name FROM users"));
    expect(res).toMatchObject({ type: "error", requestId: 1 });
    if (res.type !== "error") return;
    expect(res.message).toMatch(/syntax error/);
  });

  it("ユーザーが practice DB を壊しても reference DB の期待結果は影響を受けない", async () => {
    const res = await executeRequest(queryRequest("DROP TABLE users; SELECT 1 WHERE 0"));
    if (res.type !== "result") throw new Error("unexpected");
    expect(res.expected?.rows).toHaveLength(3);
    expect(res.correct).toBe(false);
  });

  it("MAX_RESULT_ROWS を超える行は打ち切るが採点は全行で行う", async () => {
    const bigSql = `
      WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM seq WHERE n < 600)
      SELECT n FROM seq
    `;
    const req: ExecuteRequest = {
      type: "execute",
      requestId: 2,
      setupSql,
      userSql: bigSql,
      grading: { kind: "query", solutionSql: bigSql, orderMatters: false },
    };
    const res = await executeRequest(req);
    if (res.type !== "result") throw new Error("unexpected");
    expect(res.correct).toBe(true);
    expect(res.truncated).toBe(true);
    expect(res.result.rows).toHaveLength(MAX_RESULT_ROWS);
    expect(res.expected?.rows).toHaveLength(MAX_RESULT_ROWS);
  });
});

describe("executeRequest (mutation)", () => {
  const mutationRequest = (userSql: string): ExecuteRequest => ({
    type: "execute",
    requestId: 3,
    setupSql,
    userSql,
    grading: { kind: "mutation", verifySql: "SELECT name = 'Zed' FROM users WHERE id = 2" },
  });

  it("verifySql が真になれば correct=true。expected は付かない", async () => {
    const res = await executeRequest(mutationRequest("UPDATE users SET name = 'Zed' WHERE id = 2"));
    if (res.type !== "result") throw new Error("unexpected");
    expect(res.correct).toBe(true);
    expect(res.expected).toBeUndefined();
    expect(res.result).toEqual({ columns: [], rows: [] });
  });

  it("変更が不十分なら correct=false", async () => {
    const res = await executeRequest(mutationRequest("UPDATE users SET name = 'Zed' WHERE id = 1"));
    if (res.type !== "result") throw new Error("unexpected");
    expect(res.correct).toBe(false);
  });

  it("対象行を消してしまった場合も correct=false", async () => {
    const res = await executeRequest(mutationRequest("DELETE FROM users WHERE id = 2"));
    if (res.type !== "result") throw new Error("unexpected");
    expect(res.correct).toBe(false);
  });
});
