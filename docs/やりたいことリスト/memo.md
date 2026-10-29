# このファイルの運用方針

雑にやりたいことを溜めていくファイル.
ここにはあまり整理せずになんでも書いていく。実装判断したタスクは tsks.md に移動し、ここから該当項目を取り除く。

## やりたいことリスト

### 将来モード（企画書 §17）

- Random モード: カテゴリ横断でランダム出題（実務に近い反射練習）
- Category モード: JOIN × 20問 のような弱点集中
- Time Attack: 10分で何問解けるか
- Daily: 毎日10問

### MVP 後の問題カテゴリ（企画書 §13）

- 応用情報の範囲で未収録: ANY / ALL（SQLite 非対応）、RIGHT / FULL OUTER JOIN、参照制約違反と CASCADE（`PRAGMA foreign_keys` が必要）、トランザクション・権限・カーソル（アプリの仕組み上出題不可）
- Expression（CASE / COALESCE / NULL）
- recursive CTE
- Dataset 追加: company / sns

### ゲーム性（企画書 §16）

- 🔥 streak 表示
- Accuracy / 平均解答時間の表示
- 「もう一問だけ」を起こす最小限の演出（大きな演出は不要）

### 学習補助

- SchemaViewer に SELECT 補完用のテーブル・列名を渡す（CodeMirror lang-sql の `schema` オプション）

### 性能・基盤

- seed が大きくなったら事前生成 SQLite DB を deserialize する方式へ切替（企画書 §6）
