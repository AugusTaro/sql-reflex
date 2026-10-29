import type { Exercise } from "../../domain/exercise/types";

const exercises: Exercise[] = [
  {
    id: "agg-001",
    title: "国ごとのユーザー数",
    prompt: "country ごとのユーザー数を取得してください。列は country、ユーザー数の順とします。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Aggregate", "GROUP BY", "COUNT"],
    type: "query",
    solutionSql: "SELECT country, COUNT(*) FROM users GROUP BY country",
  },
  {
    id: "agg-002",
    title: "ユーザーごとの注文数",
    prompt: "注文があるユーザーについて user_id と注文数を取得してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Aggregate", "GROUP BY", "COUNT"],
    type: "query",
    solutionSql: "SELECT user_id, COUNT(*) FROM orders GROUP BY user_id",
  },
  {
    id: "agg-003",
    title: "注文ごとの合計金額",
    prompt:
      "注文ごとの合計金額（quantity × unit_price の合計）を取得してください。列は order_id、合計金額の順とします。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Aggregate", "GROUP BY", "SUM"],
    type: "query",
    solutionSql: `
      SELECT order_id, SUM(quantity * unit_price)
      FROM order_items
      GROUP BY order_id
    `,
  },
  {
    id: "agg-004",
    title: "ステータス別の注文数",
    prompt: "status ごとの注文数を取得してください。列は status、注文数の順とします。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Aggregate", "GROUP BY", "COUNT"],
    type: "query",
    solutionSql: "SELECT status, COUNT(*) FROM orders GROUP BY status",
  },
  {
    id: "agg-005",
    title: "カテゴリごとの商品数と平均価格",
    prompt:
      "商品が存在するカテゴリについて、カテゴリの name、商品数、price の平均を取得してください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Aggregate", "GROUP BY", "AVG", "JOIN"],
    type: "query",
    solutionSql: `
      SELECT c.name, COUNT(*), AVG(p.price)
      FROM products p
      JOIN categories c ON c.id = p.category_id
      GROUP BY c.id
    `,
  },
  {
    id: "agg-006",
    title: "2 回以上注文したユーザー",
    prompt: "注文数が 2 件以上のユーザーの user_id と注文数を取得してください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Aggregate", "HAVING"],
    type: "query",
    solutionSql: `
      SELECT user_id, COUNT(*)
      FROM orders
      GROUP BY user_id
      HAVING COUNT(*) >= 2
    `,
    hints: ["集約結果への条件は WHERE ではなく HAVING で書きます"],
  },
  {
    id: "agg-007",
    title: "累計 3 個以上売れた商品",
    prompt:
      "累計販売数量（quantity の合計）が 3 以上の商品について、商品の name と累計販売数量を取得してください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Aggregate", "HAVING", "JOIN"],
    type: "query",
    solutionSql: `
      SELECT p.name, SUM(oi.quantity)
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
      GROUP BY p.id
      HAVING SUM(oi.quantity) >= 3
    `,
  },
  {
    id: "agg-008",
    title: "年ごとの注文件数",
    prompt:
      "注文年（ordered_at の先頭 4 文字）ごとの注文件数を取得してください。列は年、件数の順とします。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Aggregate", "GROUP BY", "関数"],
    type: "query",
    solutionSql: `
      SELECT strftime('%Y', ordered_at), COUNT(*)
      FROM orders
      GROUP BY 1
    `,
    hints: ["substr(ordered_at, 1, 4) か strftime('%Y', ordered_at) が使えます"],
  },
  {
    id: "agg-009",
    title: "ユーザーごとの最高・最低注文額",
    prompt:
      "注文があるユーザーについて、ユーザーの name、注文 1 件あたりの合計金額の最大値と最小値を取得してください。cancelled の注文は除外してください。",
    datasetId: "ecommerce",
    difficulty: 3,
    tags: ["Aggregate", "MIN / MAX", "サブクエリ"],
    type: "query",
    solutionSql: `
      SELECT u.name, MAX(t.total), MIN(t.total)
      FROM (
        SELECT o.id, o.user_id, SUM(oi.quantity * oi.unit_price) AS total
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.id
        WHERE o.status <> 'cancelled'
        GROUP BY o.id
      ) t
      JOIN users u ON u.id = t.user_id
      GROUP BY u.id
    `,
    hints: ["まず注文ごとの合計を出し、それをユーザーで集約します（2 段階の GROUP BY）"],
  },
  {
    id: "agg-010",
    title: "COUNT(*) と COUNT(列) の違い",
    prompt:
      "orders の総件数と、coupon_code が NULL でない件数を 1 行で取得してください。列は総件数、クーポン件数の順とします。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Aggregate", "COUNT"],
    type: "query",
    solutionSql: "SELECT COUNT(*), COUNT(coupon_code) FROM orders",
    hints: ["COUNT(列名) は NULL を数えません"],
  },
  {
    id: "agg-011",
    title: "商品価格の最小・最大・合計",
    prompt:
      "products 全体の price の最小値、最大値、合計を 1 行で取得してください。列はこの順とします。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Aggregate", "MIN / MAX", "SUM"],
    type: "query",
    solutionSql: "SELECT MIN(price), MAX(price), SUM(price) FROM products",
  },
];

export default exercises;
