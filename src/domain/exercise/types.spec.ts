import { describe, expect, it } from "vitest";
import type { Exercise } from "./types";

describe("Exercise 型", () => {
  it("企画書 §7 のサンプル問題を表現できる", () => {
    const exercise: Exercise = {
      id: "join-001",
      title: "注文したユーザー",
      prompt: "注文履歴が存在するユーザーの名前と注文金額を取得してください。",
      datasetId: "ecommerce",
      difficulty: 1,
      tags: ["JOIN"],
      type: "query",
      solutionSql: `
        SELECT users.name, orders.amount
        FROM users
        JOIN orders ON users.id = orders.user_id
      `,
      orderMatters: false,
    };

    expect(exercise.type).toBe("query");
    expect(exercise.tags).toContain("JOIN");
  });
});
