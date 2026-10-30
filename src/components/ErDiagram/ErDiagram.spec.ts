import { describe, expect, it } from "vitest";
import { datasets } from "../../datasets";
import { parseSchema } from "../../domain/dataset/schema";
import { BOX_WIDTH, layoutSchema } from "./ErDiagram";

describe("layoutSchema", () => {
  const layout = layoutSchema(parseSchema(datasets.ecommerce.schemaSql));
  const box = (name: string) => {
    const found = layout.boxes.find((b) => b.table.name === name);
    if (!found) throw new Error(name);
    return found;
  };

  it("参照の深さで列を分ける（参照先が左、参照元が右）", () => {
    expect(box("users").depth).toBe(0);
    expect(box("categories").depth).toBe(0); // 自己参照は深さに数えない
    expect(box("products").depth).toBe(1);
    expect(box("orders").depth).toBe(1);
    expect(box("vip_users").depth).toBe(1);
    expect(box("order_items").depth).toBe(2);
    expect(box("order_items").x).toBeGreaterThan(box("orders").x);
    expect(box("orders").x).toBeGreaterThan(box("users").x);
  });

  it("同じ列のテーブルは縦に重ならない", () => {
    const users = box("users");
    const categories = box("categories");
    expect(categories.y).toBeGreaterThanOrEqual(users.y + users.height);
  });

  it("REFERENCES ごとに線を 1 本引き、自己参照は self になる", () => {
    expect(layout.edges).toHaveLength(6);
    const self = layout.edges.filter((e) => e.self);
    expect(self.map((e) => e.from)).toEqual([{ table: "categories", column: "parent_id" }]);
    expect(layout.edges.every((e) => e.path.startsWith("M "))).toBe(true);
  });

  it("viewBox が全テーブルを含む", () => {
    for (const b of layout.boxes) {
      expect(b.x + b.width).toBeLessThanOrEqual(layout.width);
      expect(b.y + b.height).toBeLessThanOrEqual(layout.height);
    }
    expect(layout.width).toBeGreaterThanOrEqual(3 * BOX_WIDTH);
  });

  it("テーブルが無ければ空のレイアウト", () => {
    const empty = layoutSchema({ tables: [] });
    expect(empty.boxes).toEqual([]);
    expect(empty.edges).toEqual([]);
  });
});
