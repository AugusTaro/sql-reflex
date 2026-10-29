import { describe, expect, it } from "vitest";
import { datasets } from "../../datasets";
import { parseSchema } from "./schema";

describe("parseSchema", () => {
  it("列名・型・主キー・NOT NULL・参照を読む", () => {
    const schema = parseSchema(`
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL,           -- 'pending' | 'paid'
        coupon_code TEXT                -- NULL の場合あり
      );
    `);
    expect(schema.tables).toHaveLength(1);
    const [orders] = schema.tables;
    expect(orders.name).toBe("orders");
    expect(orders.columns.map((c) => c.name)).toEqual(["id", "user_id", "status", "coupon_code"]);
    expect(orders.columns[0]).toMatchObject({ type: "INTEGER", primaryKey: true });
    expect(orders.columns[1]).toMatchObject({
      notNull: true,
      references: { table: "users", column: "id" },
    });
    expect(orders.columns[3]).toMatchObject({ type: "TEXT", notNull: false, primaryKey: false });
  });

  it("表制約の PRIMARY KEY / FOREIGN KEY も列に反映する", () => {
    const schema = parseSchema(`
      CREATE TABLE t (
        a INTEGER,
        b INTEGER,
        PRIMARY KEY (a),
        FOREIGN KEY (b) REFERENCES users(id),
        CHECK (a > 0)
      );
    `);
    const [t] = schema.tables;
    expect(t.columns).toHaveLength(2);
    expect(t.columns[0].primaryKey).toBe(true);
    expect(t.columns[1].references).toEqual({ table: "users", column: "id" });
  });

  it("CREATE TABLE 以外の文と先頭コメントは無視する", () => {
    const schema = parseSchema(`
      -- comment
      CREATE INDEX idx ON t(a);
      CREATE TABLE t (a INTEGER);
    `);
    expect(schema.tables.map((t) => t.name)).toEqual(["t"]);
  });

  it("ecommerce の schema.sql を全テーブル読める", () => {
    const schema = parseSchema(datasets.ecommerce.schemaSql);
    expect(schema.tables.map((t) => t.name)).toEqual([
      "users",
      "categories",
      "products",
      "orders",
      "order_items",
      "vip_users",
    ]);
    const categories = schema.tables.find((t) => t.name === "categories");
    expect(categories?.columns.find((c) => c.name === "parent_id")?.references).toEqual({
      table: "categories",
      column: "id",
    });
  });
});
