---
name: exec-tsks
description: This skill should be used when the user wants to pick up and execute tasks from the project's task list (docs/やりたいことリスト/tsks.md). It reads unstarted tasks, prioritizes them by scope and dependencies, automatically enters plan mode to create an implementation plan, and waits for the user to approve the plan before proceeding with implementation on a feature branch with a PR — never committing directly to main unless explicitly told to.
---

# exec-tsks

`docs/やりたいことリスト/tsks.md` の未着手タスクをピックアップし、自動でプランを作成してユーザーの承認を待つ。

## ワークフロー

### 1. タスクリストを読み込む

`docs/やりたいことリスト/tsks.md` を Read ツールで読み込み、`## 未着手タスク` セクションの `- [ ]` 行を列挙する。

### 2. 優先度を判断して自動選択する

以下の観点で優先度を評価し、実施するタスクを **自動で 1 つ選択する**（ユーザーへの確認は不要）。

- **ユーザー指定**: ユーザーが特定タスクを指定している場合はそちらを最優先
- **スコープが小さい**: 単一ファイル・単一機能の変更で完結するものを優先
- **依存関係がない**: 他の未着手タスクに依存していないものを優先
- **基盤整備・DX 改善**: `(P2)` と明記された大機能より、インフラや開発体験の改善を優先

選んだタスクと選択理由を 1〜2 行で出力したうえで、即座に次のステップへ進む。

### 3. プランモードに入ってプランを作成する

`EnterPlanMode` ツールを呼び出し、プランモードに入る。

プランモード内で以下を実施する：

- 関連ファイルを調査し、実装方針を決定する
- 変更するファイル・追加するファイルを列挙する
- 実装ステップを具体的に記述する
- 懸念点・リスクがあれば明記する

**プラン作成が完了したらそこで停止し、ユーザーの承認を待つ。承認なしに実装へ進んではならない。**

### 4. ブランチを切って実装する（承認後）

ユーザーがプランを承認したら `ExitPlanMode` で実装モードに戻り、作業を開始する。

**ユーザーから明示的に「mainに直接コミットしてよい」と指示されない限り、main ブランチへの直接コミットは禁止。**

```bash
git checkout -b <feature/fix の短い kebab-case 名>
```

**tsks.md の状態遷移は必ず作業コミットに含める。単独コミットにしない。**

| タイミング | tsks.md の操作 | コミットへの含め方 |
|---|---|---|
| 実装開始（最初のコミット時） | `## 未着手タスク` → `## 進行中のタスク` へ移動 | 最初の実装コミットに同梱 |
| 実装完了（最後のコミット時） | `## 進行中のタスク` → `## 完了済みタスク` へ移動し `- [ ]` → `- [x]` に変える | 最後の実装コミットに同梱 |

実装完了後: コミット（tsks.md 完了状態を含む）→ プッシュ → PR 作成。

### 6. 次のタスクへ

PR 作成後、残りの未着手タスクを再提示し、続けて着手するかユーザーに確認する。
