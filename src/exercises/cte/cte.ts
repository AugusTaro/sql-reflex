import type { Exercise } from "../../domain/exercise/types";

const exercises: Exercise[] = [
  {
    id: "cte-001",
    title: "ユーザーごとの累計購入額",
    prompt:
      "WITH で注文ごとの合計金額（quantity × unit_price の合計）を求めたうえで、ユーザーの name と累計購入額を取得してください。注文があるユーザーのみ対象です。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["CTE", "WITH"],
    type: "query",
    solutionSql: `
      WITH order_totals AS (
        SELECT order_id, SUM(quantity * unit_price) AS total
        FROM order_items
        GROUP BY order_id
      )
      SELECT u.name, SUM(ot.total)
      FROM orders o
      JOIN order_totals ot ON ot.order_id = o.id
      JOIN users u ON u.id = o.user_id
      GROUP BY u.id
    `,
  },
  {
    id: "cte-002",
    title: "2 万円以上の注文",
    prompt:
      "WITH で注文ごとの合計金額を求め、合計金額が 20000 以上の注文について注文の id、ユーザーの name、合計金額を取得してください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["CTE", "WITH"],
    type: "query",
    solutionSql: `
      WITH order_totals AS (
        SELECT order_id, SUM(quantity * unit_price) AS total
        FROM order_items
        GROUP BY order_id
      )
      SELECT o.id, u.name, ot.total
      FROM orders o
      JOIN order_totals ot ON ot.order_id = o.id
      JOIN users u ON u.id = o.user_id
      WHERE ot.total >= 20000
    `,
  },
  {
    id: "cte-004",
    title: "Electronics 配下のカテゴリ",
    prompt:
      "再帰 CTE を使って、name が 'Electronics' のカテゴリの子孫カテゴリ（自身は含まない）の name をすべて取得してください。",
    datasetId: "ecommerce",
    difficulty: 3,
    tags: ["CTE", "再帰CTE"],
    type: "query",
    solutionSql: `
      WITH RECURSIVE tree(id) AS (
        SELECT id FROM categories WHERE name = 'Electronics'
        UNION ALL
        SELECT c.id FROM categories c JOIN tree ON c.parent_id = tree.id
      )
      SELECT c.name
      FROM categories c
      JOIN tree ON tree.id = c.id
      WHERE c.name <> 'Electronics'
    `,
  },
];

export default exercises;
