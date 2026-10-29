import { describe, expect, it } from "vitest";
import { categoryOf, filterByCategory, listCategories, pickNext, sortExercises } from "./select";
import type { Exercise } from "./types";

const ex = (id: string, category: string, difficulty: Exercise["difficulty"] = 1): Exercise => ({
  id,
  title: id,
  prompt: id,
  datasetId: "ecommerce",
  difficulty,
  tags: [category],
  type: "query",
  solutionSql: "SELECT 1",
});

const all = [
  ex("join-002", "JOIN", 2),
  ex("basic-001", "Basic"),
  ex("join-001", "JOIN"),
  ex("agg-001", "Aggregate", 3),
];

describe("categoryOf / listCategories", () => {
  it("tags の先頭をカテゴリとする", () => {
    expect(categoryOf(ex("x", "JOIN"))).toBe("JOIN");
  });

  it("カテゴリ一覧は推奨順（Basic → JOIN → Aggregate …）に重複なしで返す", () => {
    expect(listCategories(all)).toEqual(["Basic", "JOIN", "Aggregate"]);
  });

  it("推奨順に無いカテゴリは末尾に名前順で並ぶ", () => {
    const withExtra = [...all, ex("z-001", "Zeta"), ex("y-001", "Expression")];
    expect(listCategories(withExtra)).toEqual(["Basic", "JOIN", "Aggregate", "Expression", "Zeta"]);
  });
});

describe("filterByCategory", () => {
  it('"all" は全件', () => {
    expect(filterByCategory(all, "all")).toHaveLength(4);
  });

  it("カテゴリ指定でその問題だけ返す", () => {
    expect(filterByCategory(all, "JOIN").map((e) => e.id)).toEqual(["join-002", "join-001"]);
  });
});

describe("sortExercises", () => {
  it("difficulty 昇順、同じなら id 昇順", () => {
    expect(sortExercises(all).map((e) => e.id)).toEqual([
      "basic-001",
      "join-001",
      "join-002",
      "agg-001",
    ]);
  });
});

describe("pickNext", () => {
  const list = sortExercises(all);

  it("現在の次にある未解答を返す", () => {
    expect(pickNext(list, "basic-001", new Set())?.id).toBe("join-001");
  });

  it("解答済みはスキップする", () => {
    expect(pickNext(list, "basic-001", new Set(["join-001"]))?.id).toBe("join-002");
  });

  it("末尾に達したら先頭へ戻る", () => {
    expect(pickNext(list, "agg-001", new Set())?.id).toBe("basic-001");
  });

  it("全問解答済みなら現在の次の問題を返す（周回できる）", () => {
    const solved = new Set(list.map((e) => e.id));
    expect(pickNext(list, "basic-001", solved)?.id).toBe("join-001");
  });

  it("現在の問題がリストに無ければ先頭の未解答を返す", () => {
    expect(pickNext(list, undefined, new Set(["basic-001"]))?.id).toBe("join-001");
  });

  it("リストが空なら undefined", () => {
    expect(pickNext([], undefined, new Set())).toBeUndefined();
  });
});
