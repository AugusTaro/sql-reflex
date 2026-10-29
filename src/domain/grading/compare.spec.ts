import { describe, expect, it } from "vitest";
import type { ResultSet } from "../exercise/types";
import { compareResultSets } from "./compare";

const rs = (columns: string[], rows: unknown[][]): ResultSet => ({ columns, rows });

describe("compareResultSets", () => {
  it("列数・値・行数が一致すれば正解", () => {
    const a = rs(
      ["name", "amount"],
      [
        ["Alice", 100],
        ["Bob", 200],
      ],
    );
    const b = rs(
      ["name", "amount"],
      [
        ["Alice", 100],
        ["Bob", 200],
      ],
    );
    expect(compareResultSets(a, b, false)).toBe(true);
  });

  it("列名が違っても列の並びと値が同じなら正解（エイリアス差を許容）", () => {
    const a = rs(["users.name"], [["Alice"]]);
    const b = rs(["user_name"], [["Alice"]]);
    expect(compareResultSets(a, b, false)).toBe(true);
  });

  it("列数が違えば不正解", () => {
    const a = rs(["name"], [["Alice"]]);
    const b = rs(["name", "id"], [["Alice", 1]]);
    expect(compareResultSets(a, b, false)).toBe(false);
  });

  it("行数が違えば不正解", () => {
    const a = rs(["name"], [["Alice"]]);
    const b = rs(["name"], [["Alice"], ["Bob"]]);
    expect(compareResultSets(a, b, false)).toBe(false);
  });

  it("orderMatters=false なら行順が違っても正解", () => {
    const a = rs(["name"], [["Bob"], ["Alice"]]);
    const b = rs(["name"], [["Alice"], ["Bob"]]);
    expect(compareResultSets(a, b, false)).toBe(true);
  });

  it("orderMatters=true なら行順が違うと不正解", () => {
    const a = rs(["name"], [["Bob"], ["Alice"]]);
    const b = rs(["name"], [["Alice"], ["Bob"]]);
    expect(compareResultSets(a, b, true)).toBe(false);
  });

  it("重複行の数も一致する必要がある", () => {
    const a = rs(["name"], [["Alice"], ["Alice"]]);
    const b = rs(["name"], [["Alice"], ["Bob"]]);
    expect(compareResultSets(a, b, false)).toBe(false);
  });

  it("NULL と空文字・0 は区別する", () => {
    expect(compareResultSets(rs(["v"], [[null]]), rs(["v"], [[""]]), false)).toBe(false);
    expect(compareResultSets(rs(["v"], [[null]]), rs(["v"], [[0]]), false)).toBe(false);
    expect(compareResultSets(rs(["v"], [[null]]), rs(["v"], [[null]]), false)).toBe(true);
  });

  it("数値と文字列は区別する", () => {
    expect(compareResultSets(rs(["v"], [[1]]), rs(["v"], [["1"]]), false)).toBe(false);
  });

  it("bigint と同値の number は同一視する", () => {
    expect(compareResultSets(rs(["v"], [[1n]]), rs(["v"], [[1]]), false)).toBe(true);
  });

  it("BLOB はバイト列で比較する", () => {
    const a = rs(["v"], [[new Uint8Array([1, 2])]]);
    const b = rs(["v"], [[new Uint8Array([1, 2])]]);
    const c = rs(["v"], [[new Uint8Array([1, 3])]]);
    expect(compareResultSets(a, b, false)).toBe(true);
    expect(compareResultSets(a, c, false)).toBe(false);
  });

  it("空の結果同士は正解", () => {
    expect(compareResultSets(rs(["v"], []), rs(["w"], []), false)).toBe(true);
  });
});
