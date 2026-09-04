# 確定済みのタスクリスト

memo からタスクに昇格したもののリスト。未着手/進行中/完了 の3つのステータスで管理する。
番号は企画書 §20 の Phase に対応する。

## 未着手タスク

- [ ] Phase 1: SQLite WASM 単体 PoC — ブラウザで `SELECT * FROM users;` を実行して ResultSet を取得する
- [ ] Phase 2: Web Worker 化 — UI → Worker → SQLite の経路を成立させる（`src/sqlite/worker.ts` / `client.ts`）
- [ ] Phase 3: Dataset 読み込み — schema.sql / seed.sql から毎回新品の `:memory:` DB を生成する
- [ ] Phase 4: Exercise モデル実装 — 固定問題1問で 問題 → SQL → Run → Result を成立させる
- [ ] Phase 5: ResultSet 採点 — solutionSql の結果と比較する（orderMatters 対応）
- [ ] Phase 6: Mutation 採点 — verifySql 対応
- [ ] Phase 7: UI — CodeMirror エディタ / ResultTable / SchemaViewer / Cmd+Enter ショートカット
- [ ] Phase 8: 問題追加 — SELECT / JOIN / GROUP BY / HAVING / Subquery / CTE を中心に30問程度
- [ ] Phase 9: Progress / streak — localStorage に進捗保存、カテゴリ選択
- [ ] Phase 10: 静的ホスティングして公開
- [ ] 暴走対策 — Query Timeout（Worker terminate → 再生成）と ResultSet 500 行制限（企画書 §11）

## 進行中のタスク

## 完了済みタスク

- [x] 第一ウェーブ: ドキュメント作成（企画書・CLAUDE.md・やりたいことリスト）と開発環境構築（pnpm + Vite + React + TS + Biome + Vitest）
