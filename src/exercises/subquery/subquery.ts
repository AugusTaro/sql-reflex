import type { Exercise } from "../../domain/exercise/types";

const exercises: Exercise[] = [
  {
    id: "sub-001",
    title: "平均より高い商品",
    prompt: "price が全商品の平均 price より高い商品の name と price を取得してください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Subquery", "スカラーサブクエリ"],
    type: "query",
    solutionSql: `
      SELECT name, price
      FROM products
      WHERE price > (SELECT AVG(price) FROM products)
    `,
  },
  {
    id: "sub-002",
    title: "注文経験のあるユーザー（IN）",
    prompt: "注文が 1 件以上あるユーザーの name を取得してください。IN を使ってください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Subquery", "IN"],
    type: "query",
    solutionSql: `
      SELECT name
      FROM users
      WHERE id IN (SELECT user_id FROM orders)
    `,
  },
  {
    id: "sub-003",
    title: "注文経験のないユーザー（NOT EXISTS）",
    prompt: "注文が 1 件も無いユーザーの name を取得してください。NOT EXISTS を使ってください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Subquery", "EXISTS"],
    type: "query",
    solutionSql: `
      SELECT name
      FROM users u
      WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id)
    `,
  },
  {
    id: "sub-004",
    title: "ユーザーごとの最新注文",
    prompt:
      "各ユーザーの最新（ordered_at が最大）の注文について、user_id、注文の id、ordered_at を取得してください。",
    datasetId: "ecommerce",
    difficulty: 3,
    tags: ["Subquery", "相関サブクエリ"],
    type: "query",
    solutionSql: `
      SELECT o.user_id, o.id, o.ordered_at
      FROM orders o
      WHERE o.ordered_at = (
        SELECT MAX(ordered_at) FROM orders WHERE user_id = o.user_id
      )
    `,
    hints: ["外側の行の user_id を内側の WHERE で参照します"],
  },
  {
    id: "sub-005",
    title: "合計金額が最大の注文",
    prompt:
      "合計金額（quantity × unit_price の合計）が最も大きい注文の id と合計金額を取得してください。",
    datasetId: "ecommerce",
    difficulty: 3,
    tags: ["Subquery", "FROM 句サブクエリ"],
    type: "query",
    solutionSql: `
      SELECT order_id, total
      FROM (
        SELECT order_id, SUM(quantity * unit_price) AS total
        FROM order_items
        GROUP BY order_id
      )
      WHERE total = (
        SELECT MAX(t) FROM (
          SELECT SUM(quantity * unit_price) AS t FROM order_items GROUP BY order_id
        )
      )
    `,
    hints: ["ORDER BY ... LIMIT 1 でも同じ結果になります"],
  },
  {
    id: "sub-006",
    title: "カテゴリ内で最も高い商品",
    prompt:
      "各カテゴリについて、そのカテゴリ内で price が最大の商品の category_id、name、price を取得してください。",
    datasetId: "ecommerce",
    difficulty: 3,
    tags: ["Subquery", "相関サブクエリ"],
    type: "query",
    solutionSql: `
      SELECT p.category_id, p.name, p.price
      FROM products p
      WHERE p.price = (
        SELECT MAX(price) FROM products WHERE category_id = p.category_id
      )
    `,
  },
];

export default exercises;
