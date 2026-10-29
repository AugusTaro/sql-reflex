type Props = {
  schemaSql: string;
};

/**
 * schema.sql を CREATE TABLE ごとに区切って表示する。パーサは持たず、正規表現で分割するだけ。
 */
const splitTables = (schemaSql: string): { name: string; body: string }[] =>
  schemaSql
    .split(/;\s*/)
    .map((s) => s.trim())
    .filter((s) => /^CREATE TABLE/i.test(s))
    .map((statement) => ({
      name: statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?"?(\w+)"?/i)?.[1] ?? "?",
      body: `${statement};`,
    }));

export const SchemaViewer = ({ schemaSql }: Props) => {
  const tables = splitTables(schemaSql);
  return (
    <div className="schema-viewer">
      {tables.map((table) => (
        <details key={table.name} open>
          <summary>{table.name}</summary>
          <pre>
            <code>{table.body}</code>
          </pre>
        </details>
      ))}
    </div>
  );
};
