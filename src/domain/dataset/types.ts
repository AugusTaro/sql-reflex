/**
 * 複数の問題で共有する Dataset（企画書 §6）。
 * schema.sql / seed.sql の中身を文字列として持つ。SQLite 実装には依存しない。
 */
export type Dataset = {
  id: string;
  name: string;
  schemaSql: string;
  seedSql: string;
};

/** Run ごとに新品の DB へ流す初期化 SQL（企画書 §5） */
export const toSetupSql = (dataset: Dataset): string => `${dataset.schemaSql}\n${dataset.seedSql}`;
