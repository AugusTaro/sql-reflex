/**
 * schema.sql を ER 図向けの構造（テーブル・列・参照関係）に変換する純関数。
 * 本格的な SQL パーサは持たず、このプロジェクトの schema.sql の書き方
 * （1 行 1 列定義、`--` コメント、列制約としての REFERENCES）を前提にした正規表現で読む。
 * SQLite 実装には依存しない（企画書 §19）。
 */

export type SchemaColumn = {
  name: string;
  type: string;
  primaryKey: boolean;
  notNull: boolean;
  /** 列制約または表制約の FOREIGN KEY で参照している先 */
  references?: { table: string; column: string };
};

export type SchemaTable = {
  name: string;
  columns: SchemaColumn[];
};

export type Schema = {
  tables: SchemaTable[];
};

const stripComment = (line: string): string => line.replace(/--.*$/, "").trim();

const REFERENCES = /REFERENCES\s+"?(\w+)"?\s*\(\s*"?(\w+)"?\s*\)/i;

const parseColumn = (line: string): SchemaColumn | undefined => {
  const match = line.match(/^"?(\w+)"?(?:\s+(\w+(?:\(\d+(?:,\s*\d+)?\))?))?(.*)$/);
  if (!match) return undefined;
  const [, name, type = "", rest = ""] = match;
  const ref = rest.match(REFERENCES);
  return {
    name,
    type,
    primaryKey: /PRIMARY\s+KEY/i.test(rest),
    notNull: /NOT\s+NULL/i.test(rest),
    references: ref ? { table: ref[1], column: ref[2] } : undefined,
  };
};

/** 表制約の行（PRIMARY KEY (...) / FOREIGN KEY (...) REFERENCES ... など）か */
const isTableConstraint = (line: string): boolean =>
  /^(CONSTRAINT\s+\w+\s+)?(PRIMARY\s+KEY|FOREIGN\s+KEY|UNIQUE|CHECK)\b/i.test(line);

const applyTableConstraint = (line: string, columns: SchemaColumn[]): void => {
  const pk = line.match(/PRIMARY\s+KEY\s*\(([^)]*)\)/i);
  if (pk) {
    for (const name of pk[1].split(",").map((s) => s.trim().replace(/"/g, ""))) {
      const column = columns.find((c) => c.name === name);
      if (column) column.primaryKey = true;
    }
  }
  const fk = line.match(/FOREIGN\s+KEY\s*\(\s*"?(\w+)"?\s*\)\s*(REFERENCES.*)$/i);
  if (fk) {
    const ref = fk[2].match(REFERENCES);
    const column = columns.find((c) => c.name === fk[1]);
    if (column && ref) column.references = { table: ref[1], column: ref[2] };
  }
};

const parseTable = (statement: string): SchemaTable | undefined => {
  const head = statement.match(/^CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?"?(\w+)"?\s*\(/i);
  if (!head) return undefined;
  const open = statement.indexOf("(");
  const close = statement.lastIndexOf(")");
  const body = statement.slice(open + 1, close);

  const columns: SchemaColumn[] = [];
  const constraints: string[] = [];
  for (const raw of body.split("\n")) {
    const line = stripComment(raw).replace(/,\s*$/, "");
    if (line === "") continue;
    if (isTableConstraint(line)) {
      constraints.push(line);
      continue;
    }
    const column = parseColumn(line);
    if (column) columns.push(column);
  }
  for (const constraint of constraints) applyTableConstraint(constraint, columns);

  return { name: head[1], columns };
};

export const parseSchema = (schemaSql: string): Schema => ({
  tables: schemaSql
    .split(/;\s*/)
    .map((s) => s.trim())
    .map(parseTable)
    .filter((t): t is SchemaTable => t !== undefined),
});
