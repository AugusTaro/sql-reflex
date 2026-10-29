# CLAUDE.md — SQL Reflex

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

ブラウザ上で SQL を高速に反復練習する静的 SPA。SQL の知識はあるが JOIN / GROUP BY / サブクエリを手癖で書けるまで反復したい人向けの「SQL 版タイピングゲーム」。
バックエンドなし。SQLite WASM を Web Worker 内で動かし、Run ごとに `:memory:` DB を作り直して実行・採点する。

## 正本の所在

1. `docs/企画書.md` — 企画・実装仕様のすべて。迷ったらここに戻る
2. `docs/やりたいことリスト/tsks.md` — 確定タスク（企画書 §20 の Phase 1〜10 が並ぶ）

## 絶対に守る原則（企画書より抜粋）

1. **最小ループを邪魔しない**（§21）: Question → Write SQL → Run → Correct/Incorrect → Next。新機能は「SQL を書く回数・速度・継続率が上がるか」で判断し、摩擦になるなら削る
2. **Run 単位で DB を初期化する**（§5）: 毎回新しい `:memory:` DB に schema.sql → seed.sql → ユーザー SQL → 採点 → 破棄。DB を使い回さない。OPFS は使わない
3. **SQL 文字列比較で採点しない**（§8）: query 問題は solutionSql の ResultSet と比較（reference DB は独立）。mutation 問題は verifySql の結果で判定
4. **SQLite 依存は `src/sqlite/` に閉じ込める**（§19）: 問題定義（`src/exercises/`）・ドメイン（`src/domain/`）は SQLite 実装を直接 import しない
5. **SQL 実行は Web Worker 内**（§10）: UI スレッドで SQLite を触らない。旧 Worker1 / Promiser API には依存せず通常の Worker から直接利用する
6. **暴走対策**（§11）: Query Timeout（2 秒目安）で Worker terminate → 再生成。UI へ返す ResultSet は最大 500 行程度
7. **MVP でやらないこと**（§15）: ユーザー登録・Backend・ランキング・AI 解説・他 DBMS 対応・課金など。提案しない

## 技術スタック

- TypeScript / React 19 / Vite 8
- SQL Editor: CodeMirror 6（`codemirror` + `@codemirror/lang-sql`）
- SQL 実行: `@sqlite.org/sqlite-wasm`（Vite の `optimizeDeps.exclude` 済み）
- パッケージマネージャ: pnpm / Lint・Format: Biome / Test: Vitest
- 学習進捗のみ localStorage に保存（SQLite DB は保存しない）

## ディレクトリ構成

```text
src/
  app/          App コンポーネント
  components/   SqlEditor / ResultTable / SchemaViewer / ExercisePanel / Progress
  domain/       exercise（Exercise 型・Worker メッセージ型）/ grading / dataset
  sqlite/       worker.ts / client.ts / database.ts（SQLite 依存はここだけ）
  exercises/    問題データ（join / aggregate / subquery ...）
  datasets/     schema.sql / seed.sql（ecommerce / company ...）
  storage/      localStorage 進捗
```

## コマンド

- `pnpm install`
- `pnpm dev` — 開発サーバ（http://localhost:5173）
- `pnpm build` — 型チェック + 本番ビルド
- `pnpm typecheck` / `pnpm lint` / `pnpm lint:fix` / `pnpm test`

## docs/やりたいことリスト

タスク管理用のディレクトリ。2ファイルで運用する。

- **`memo.md`** — やりたいことを雑に溜めるファイル。整理不要、なんでも書く。
- **`tsks.md`** — memo から昇格した確定タスクのリスト。未着手/進行中/完了の3ステータスで管理。

**運用フロー**: memo.md にアイデアを書く → 実装判断したら tsks.md に移動（memo から除去）→ 実装完了で完了済みへ移動。

タスク消化時は `/exec-tsks` スキルを使う。

## 現状

MVP（Phase 1〜9 + 暴走対策）実装済み。ブラウザで問題を解き、正誤判定・進捗保存まで動く。残る確定タスクは Phase 10（静的ホスティング）のみ。リモートリポジトリは未作成（ローカル git のみ）。

- 問題は `src/exercises/<category>/*.ts` に置くだけで自動収集される。追加手順は `docs/問題の追加方法.md`
- 全問題は `pnpm test` で実 SQLite により検証される（solutionSql が動く / mutation の verifySql が真になる）
- 採点は列名を比較しない（列の並び・値・行数のみ）。prompt で列の並びを明記する
- Worker は Exercise を知らず `WorkerRequest`（setupSql / userSql / grading）だけを受け取る
