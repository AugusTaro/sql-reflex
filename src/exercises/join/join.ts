import type { Exercise } from "../../domain/exercise/types";

const exercises: Exercise[] = [
  {
    id: "join-001",
    title: "注文したユーザー",
    prompt: "各注文について、注文したユーザーの name と注文の id を取得してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["JOIN", "INNER JOIN"],
    type: "query",
    solutionSql: `
      SELECT users.name, orders.id
      FROM orders
      JOIN users ON users.id = orders.user_id
    `,
  },
  {
    id: "join-002",
    title: "注文明細の商品名",
    prompt:
      "各注文明細（order_items）について、order_id、商品の name、quantity を取得してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["JOIN", "INNER JOIN"],
    type: "query",
    solutionSql: `
      SELECT oi.order_id, p.name, oi.quantity
      FROM order_items oi
      JOIN products p ON p.id = oi.product_id
    `,
  },
  {
    id: "join-003",
    title: "商品とカテゴリ名",
    prompt: "全商品の name と、その商品が属するカテゴリの name を取得してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["JOIN", "INNER JOIN"],
    type: "query",
    solutionSql: `
      SELECT p.name, c.name
      FROM products p
      JOIN categories c ON c.id = p.category_id
    `,
  },
  {
    id: "join-004",
    title: "一度も注文していないユーザー",
    prompt: "注文が 1 件も無いユーザーの name を取得してください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["JOIN", "LEFT JOIN"],
    type: "query",
    solutionSql: `
      SELECT u.name
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      WHERE o.id IS NULL
    `,
    hints: ["LEFT JOIN して右側が NULL の行に絞ります"],
  },
  {
    id: "join-005",
    title: "ユーザーごとの注文数（0 件も含む）",
    prompt:
      "全ユーザーについて name と注文数を取得してください。注文が無いユーザーは 0 としてください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["JOIN", "LEFT JOIN", "GROUP BY"],
    type: "query",
    solutionSql: `
      SELECT u.name, COUNT(o.id)
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id
      GROUP BY u.id
    `,
    hints: ["COUNT(*) だと注文なしのユーザーも 1 になってしまいます"],
  },
  {
    id: "join-006",
    title: "親カテゴリ名",
    prompt:
      "親カテゴリを持つカテゴリについて、カテゴリの name と親カテゴリの name を取得してください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["JOIN", "SELF JOIN"],
    type: "query",
    solutionSql: `
      SELECT child.name, parent.name
      FROM categories child
      JOIN categories parent ON parent.id = child.parent_id
    `,
    hints: ["同じテーブルを別名で 2 回 FROM に並べます"],
  },
  {
    id: "join-007",
    title: "発送済み注文の明細",
    prompt:
      "status が 'shipped' の注文について、ユーザーの name、商品の name、quantity を取得してください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["JOIN", "複数JOIN"],
    type: "query",
    solutionSql: `
      SELECT u.name, p.name, oi.quantity
      FROM orders o
      JOIN users u ON u.id = o.user_id
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      WHERE o.status = 'shipped'
    `,
  },
  {
    id: "join-008",
    title: "一度も売れていない商品",
    prompt: "order_items に一度も登場しない商品の name を取得してください。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["JOIN", "LEFT JOIN"],
    type: "query",
    solutionSql: `
      SELECT p.name
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      WHERE oi.id IS NULL
    `,
  },
  {
    id: "join-009",
    title: "同じ国のユーザーペア",
    prompt:
      "同じ country のユーザーの組み合わせを取得してください。列は 1 人目の name、2 人目の name とし、同じ組を 2 回数えないよう 1 人目の id < 2 人目の id に限定してください。",
    datasetId: "ecommerce",
    difficulty: 3,
    tags: ["JOIN", "SELF JOIN"],
    type: "query",
    solutionSql: `
      SELECT a.name, b.name
      FROM users a
      JOIN users b ON a.country = b.country AND a.id < b.id
    `,
  },
  {
    id: "join-010",
    title: "ユーザーごとの paid 注文数（0 件も含む）",
    prompt:
      "全ユーザーについて、name と status が 'paid' の注文の件数を取得してください。paid 注文が無いユーザーも 0 として含めます。列は name、件数の順とします。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["JOIN", "LEFT JOIN", "ON と WHERE"],
    type: "query",
    solutionSql: `
      SELECT u.name, COUNT(o.id)
      FROM users u
      LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'paid'
      GROUP BY u.id
    `,
    hints: [
      "status の条件を WHERE に書くと、注文の無いユーザーの行（右側が NULL）が消えてしまいます",
      "外部結合で右側の表を絞り込む条件は ON に書きます",
    ],
  },
  {
    id: "join-011",
    title: "カテゴリごとの商品数（0 件も含む）",
    prompt:
      "全カテゴリについて、カテゴリの name と商品数を取得してください。商品が無いカテゴリも 0 として含めます。列は name、商品数の順とします。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["JOIN", "LEFT JOIN", "COUNT"],
    type: "query",
    solutionSql: `
      SELECT c.name, COUNT(p.id)
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
    `,
    hints: ["COUNT(*) は NULL だけの行も数えます。右側の列を COUNT すると 0 になります"],
  },
];

export default exercises;
