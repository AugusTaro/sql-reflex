# 確定済みのタスクリスト

memo からタスクに昇格したもののリスト。未着手/進行中/完了 の3つのステータスで管理する。
番号は企画書 §20 の Phase に対応する。

## 未着手タスク

## 進行中のタスク

## 完了済みタスク

- [x] ER 図表示 — schema.sql を正規表現で解析（`src/domain/dataset/schema.ts`）し、依存の深さで列を分けた SVG を自前描画（`src/components/ErDiagram/`）。結果表示の右半分に常時表示
- [x] 問題追加（応用情報の SQL 範囲に合わせた再編）— 述語 / 集合演算 / ウィンドウ関数 / DDL・制約 / INSERT SELECT を追加し 64 問に。権限・トランザクション・埋込み SQL は SQLite で扱えないため対象外
- [x] Phase 10: 静的ホスティングして公開 — GitHub Pages（`.github/workflows/deploy.yml`、main への push で自動デプロイ）
- [x] Phase 1: SQLite WASM 単体 PoC — ブラウザで `SELECT * FROM users;` を実行して ResultSet を取得する
- [x] Phase 2: Web Worker 化 — UI → Worker → SQLite の経路を成立させる（`src/sqlite/worker.ts` / `client.ts`）
- [x] Phase 3: Dataset 読み込み — schema.sql / seed.sql から毎回新品の `:memory:` DB を生成する
- [x] Phase 4: Exercise モデル実装 — 固定問題1問で 問題 → SQL → Run → Result を成立させる
- [x] Phase 5: ResultSet 採点 — solutionSql の結果と比較する（orderMatters 対応）
- [x] Phase 6: Mutation 採点 — verifySql 対応
- [x] Phase 7: UI — CodeMirror エディタ / ResultTable / SchemaViewer / Cmd+Enter ショートカット
- [x] Phase 8: 問題追加 — SELECT / JOIN / GROUP BY / HAVING / Subquery / CTE を中心に30問程度（38 問。`docs/問題の追加方法.md` 参照）
- [x] Phase 9: Progress / streak — localStorage に進捗保存、カテゴリ選択
- [x] 暴走対策 — Query Timeout（Worker terminate → 再生成）と ResultSet 500 行制限（企画書 §11）
- [x] 第一ウェーブ: ドキュメント作成（企画書・CLAUDE.md・やりたいことリスト）と開発環境構築（pnpm + Vite + React + TS + Biome + Vitest）
