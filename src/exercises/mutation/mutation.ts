import type { Exercise } from "../../domain/exercise/types";

/**
 * mutation 問題: ユーザー SQL 実行後に verifySql を流し、全行の先頭列が真なら正解。
 * solutionSql は模範解答で、テスト（exercises.spec.ts）で verifySql が真になることを検証する。
 */
const exercises: Exercise[] = [
  {
    id: "mut-001",
    title: "在庫を補充する",
    prompt: "id が 4 の商品の stock を 10 に更新してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Mutation", "UPDATE"],
    type: "mutation",
    solutionSql: "UPDATE products SET stock = 10 WHERE id = 4",
    verifySql: `
      SELECT stock = 10 FROM products WHERE id = 4
      UNION ALL
      -- 他の商品の在庫合計が初期値（214）のまま = 対象以外を変更していない
      SELECT SUM(stock) = 214 FROM products WHERE id <> 4
    `,
  },
  {
    id: "mut-002",
    title: "新規ユーザーを登録する",
    prompt:
      "users に name 'Ivy'、email 'ivy@example.com'、country 'US'、created_at '2025-04-01' のユーザーを 1 人追加してください。id は自動採番に任せてください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Mutation", "INSERT"],
    type: "mutation",
    solutionSql:
      "INSERT INTO users (name, email, country, created_at) VALUES ('Ivy', 'ivy@example.com', 'US', '2025-04-01')",
    verifySql: `
      SELECT COUNT(*) = 1
      FROM users
      WHERE name = 'Ivy' AND email = 'ivy@example.com' AND country = 'US' AND created_at = '2025-04-01'
      UNION ALL
      SELECT COUNT(*) = 9 FROM users
    `,
  },
  {
    id: "mut-003",
    title: "キャンセル注文を削除する",
    prompt:
      "status が 'cancelled' の注文を orders から削除してください（order_items はそのままで構いません）。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Mutation", "DELETE"],
    type: "mutation",
    solutionSql: "DELETE FROM orders WHERE status = 'cancelled'",
    verifySql: `
      SELECT COUNT(*) = 0 FROM orders WHERE status = 'cancelled'
      UNION ALL
      SELECT COUNT(*) = 13 FROM orders
    `,
  },
];

export default exercises;
