import type { Exercise } from "../../domain/exercise/types";

/**
 * DDL（表・ビューの定義と制約）。mutation 形式で、verifySql は sqlite_master / pragma_table_info で検証する。
 * 存在しない表を直接 SELECT すると初期状態でエラーになるため、pragma_table_info（0 行を返す）経由で確認する。
 */
const exercises: Exercise[] = [
  {
    id: "ddl-001",
    title: "テーブルを作る",
    prompt:
      "reviews テーブルを作成してください。列は id（INTEGER、主キー）、product_id（INTEGER、NOT NULL）、rating（INTEGER、NOT NULL）、comment（TEXT、NULL 可）の 4 つです。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["DDL", "CREATE TABLE"],
    type: "mutation",
    solutionSql: `
      CREATE TABLE reviews (
        id INTEGER PRIMARY KEY,
        product_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT
      )
    `,
    verifySql: `
      SELECT COUNT(*) = 4 FROM pragma_table_info('reviews')
      UNION ALL
      SELECT COUNT(*) = 1 FROM pragma_table_info('reviews') WHERE name = 'id' AND pk = 1
      UNION ALL
      SELECT COUNT(*) = 2 FROM pragma_table_info('reviews')
      WHERE name IN ('product_id', 'rating') AND "notnull" = 1
      UNION ALL
      SELECT COUNT(*) = 1 FROM pragma_table_info('reviews') WHERE name = 'comment' AND "notnull" = 0
      UNION ALL
      SELECT COUNT(*) = 3 FROM pragma_table_info('reviews')
      WHERE name IN ('id', 'product_id', 'rating') AND UPPER(type) = 'INTEGER'
      UNION ALL
      SELECT COUNT(*) = 1 FROM pragma_table_info('reviews') WHERE name = 'comment' AND UPPER(type) = 'TEXT'
    `,
  },
  {
    id: "ddl-002",
    title: "列を追加する",
    prompt: "users テーブルに phone という TEXT 型の列を追加してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["DDL", "ALTER TABLE"],
    type: "mutation",
    solutionSql: "ALTER TABLE users ADD COLUMN phone TEXT",
    verifySql: `
      SELECT COUNT(*) = 1 FROM pragma_table_info('users') WHERE name = 'phone' AND type = 'TEXT'
      UNION ALL
      SELECT COUNT(*) = 6 FROM pragma_table_info('users')
    `,
  },
  {
    id: "ddl-003",
    title: "ビューを作る",
    prompt:
      "status が 'paid' の注文の id, user_id, ordered_at を返す paid_orders というビューを作成してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["DDL", "CREATE VIEW"],
    type: "mutation",
    solutionSql:
      "CREATE VIEW paid_orders AS SELECT id, user_id, ordered_at FROM orders WHERE status = 'paid'",
    // 存在しないビューを SELECT するとエラーになるため、無ければ空のダミービューを作ってから中身を比較する
    verifySql: `
      CREATE VIEW IF NOT EXISTS paid_orders AS
        SELECT NULL AS id, NULL AS user_id, NULL AS ordered_at WHERE 0;
      SELECT COUNT(*) = 3 FROM pragma_table_info('paid_orders')
      UNION ALL
      SELECT COUNT(*) = 7 FROM paid_orders
      UNION ALL
      SELECT COUNT(*) = 7
      FROM paid_orders p
      JOIN orders o ON o.id = p.id AND o.user_id = p.user_id AND o.ordered_at = p.ordered_at
      WHERE o.status = 'paid'
    `,
    hints: ["CREATE VIEW ビュー名 AS SELECT ..."],
  },
  {
    id: "ddl-004",
    title: "制約付きのテーブルを作る",
    prompt:
      "coupons テーブルを作成してください。列は code（TEXT、主キー）と discount（INTEGER、NOT NULL、1 以上 100 以下の CHECK 制約付き）の 2 つです。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["DDL", "制約", "CHECK"],
    type: "mutation",
    solutionSql: `
      CREATE TABLE coupons (
        code TEXT PRIMARY KEY,
        discount INTEGER NOT NULL CHECK (discount BETWEEN 1 AND 100)
      )
    `,
    // CHECK の範囲は、境界値を INSERT OR IGNORE して「弾かれるか / 通るか」で検証する
    verifySql: `
      CREATE TABLE IF NOT EXISTS coupons (code TEXT, discount INTEGER);
      INSERT OR IGNORE INTO coupons (code, discount) VALUES
        ('_ng_0', 0), ('_ng_101', 101), ('_ok_1', 1), ('_ok_100', 100);
      SELECT COUNT(*) = 2 FROM pragma_table_info('coupons')
      UNION ALL
      SELECT COUNT(*) = 1 FROM pragma_table_info('coupons') WHERE name = 'code' AND pk = 1
      UNION ALL
      SELECT COUNT(*) = 1 FROM pragma_table_info('coupons') WHERE name = 'discount' AND "notnull" = 1
      UNION ALL
      SELECT COUNT(*) = 0 FROM coupons WHERE code IN ('_ng_0', '_ng_101')
      UNION ALL
      SELECT COUNT(*) = 2 FROM coupons WHERE code IN ('_ok_1', '_ok_100')
    `,
    hints: ["列定義の後ろに CHECK (条件) を付けます"],
  },
  {
    id: "ddl-005",
    title: "テーブルを削除する",
    prompt: "vip_users テーブルを削除してください。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["DDL", "DROP TABLE"],
    type: "mutation",
    solutionSql: "DROP TABLE vip_users",
    verifySql: `
      SELECT COUNT(*) = 0 FROM sqlite_master WHERE type = 'table' AND name = 'vip_users'
      UNION ALL
      -- 他のテーブルは残っている
      SELECT COUNT(*) = 5 FROM sqlite_master WHERE type = 'table'
    `,
  },
];

export default exercises;
