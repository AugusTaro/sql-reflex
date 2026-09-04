# SQL Reflex

ブラウザ上で SQL を高速に反復練習する Web アプリ。SQL 版タイピングゲーム。

- 完全な静的 SPA（バックエンドなし）
- SQLite WASM を Web Worker 内で実行し、Run ごとに `:memory:` DB を作り直す
- 採点は SQL 文字列比較ではなく実行結果の比較で行う

詳細は [docs/企画書.md](docs/企画書.md) を参照。

## 技術スタック

TypeScript / React / Vite / CodeMirror 6 / `@sqlite.org/sqlite-wasm`
pnpm / Biome / Vitest

## セットアップ

```bash
pnpm install
pnpm dev        # http://localhost:5173
```

## コマンド

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバ起動 |
| `pnpm build` | 型チェック + 本番ビルド（`dist/`） |
| `pnpm preview` | ビルド成果物のプレビュー |
| `pnpm typecheck` | 型チェックのみ |
| `pnpm lint` / `pnpm lint:fix` | Biome による Lint / Format |
| `pnpm test` | Vitest |

## タスク管理

`docs/やりたいことリスト/` の `memo.md`（アイデア）と `tsks.md`（確定タスク）で管理する。
タスク着手は `/exec-tsks` スキルから。
