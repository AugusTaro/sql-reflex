import type { Exercise } from "../../domain/exercise/types";

/** 集合演算（UNION / UNION ALL / INTERSECT / EXCEPT）。列数と型を揃える練習 */
const exercises: Exercise[] = [
  {
    id: "set-001",
    title: "和集合（UNION）",
    prompt:
      "注文したことのあるユーザーの id（orders.user_id）と、created_at が '2025-01-01' 以降のユーザーの id を、重複なしで 1 列に取得してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Set", "UNION"],
    type: "query",
    solutionSql: `
      SELECT user_id FROM orders
      UNION
      SELECT id FROM users WHERE created_at >= '2025-01-01'
    `,
    hints: ["UNION は重複行を除きます"],
  },
  {
    id: "set-002",
    title: "重複を残す和集合（UNION ALL）",
    prompt:
      "status が 'paid' の注文の user_id と、status が 'shipped' の注文の user_id を、重複を残したまま 1 列に取得してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Set", "UNION ALL"],
    type: "query",
    solutionSql: `
      SELECT user_id FROM orders WHERE status = 'paid'
      UNION ALL
      SELECT user_id FROM orders WHERE status = 'shipped'
    `,
    hints: ["UNION は重複を除き、UNION ALL は残します。行数が変わります"],
  },
  {
    id: "set-003",
    title: "共通部分（INTERSECT）",
    prompt:
      "status が 'paid' の注文をしたことがあり、かつ status が 'shipped' の注文もしたことがあるユーザーの id（user_id）を取得してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Set", "INTERSECT"],
    type: "query",
    solutionSql: `
      SELECT user_id FROM orders WHERE status = 'paid'
      INTERSECT
      SELECT user_id FROM orders WHERE status = 'shipped'
    `,
  },
  {
    id: "set-004",
    title: "差集合（EXCEPT）",
    prompt:
      "一度も注文明細（order_items）に登場していない商品の id を、products の id から order_items の product_id を引く形で取得してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Set", "EXCEPT"],
    type: "query",
    solutionSql: `
      SELECT id FROM products
      EXCEPT
      SELECT product_id FROM order_items
    `,
  },
];

export default exercises;
