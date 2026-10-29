import { describe, expect, it } from "vitest";
import { createDatabase, getSqliteVersion } from "./database";

const setupUsers = `
  CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
  INSERT INTO users (name) VALUES ('Alice'), ('Bob');
`;

describe("createDatabase", () => {
  it("SELECT の列名と行を ResultSet として返す", async () => {
    const db = await createDatabase();
    db.execute(setupUsers);

    const result = db.execute("SELECT * FROM users;");
    db.close();

    expect(result).toEqual({
      columns: ["id", "name"],
      rows: [
        [1, "Alice"],
        [2, "Bob"],
      ],
    });
  });

  it("結果列を持たない DDL / DML は空の ResultSet を返す", async () => {
    const db = await createDatabase();

    const result = db.execute(setupUsers);
    db.close();

    expect(result).toEqual({ columns: [], rows: [] });
  });

  it("0 件の SELECT でも列名は返す", async () => {
    const db = await createDatabase();
    db.execute(setupUsers);

    const result = db.execute("SELECT id, name FROM users WHERE id > 100;");
    db.close();

    expect(result).toEqual({ columns: ["id", "name"], rows: [] });
  });

  it("構文エラーの SQL は throw する", async () => {
    const db = await createDatabase();

    expect(() => db.execute("SELEC * FROM users;")).toThrow(/syntax error/);
    db.close();
  });

  it("createDatabase ごとに独立した :memory: DB になる", async () => {
    const first = await createDatabase();
    const second = await createDatabase();
    first.execute(setupUsers);

    expect(() => second.execute("SELECT * FROM users;")).toThrow(/no such table/);

    first.close();
    second.close();
  });
});

describe("getSqliteVersion", () => {
  it("SQLite のバージョン文字列を返す", async () => {
    await expect(getSqliteVersion()).resolves.toMatch(/^3\.\d+\.\d+$/);
  });
});
