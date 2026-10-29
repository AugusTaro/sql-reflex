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

- Window Function（ROW_NUMBER / RANK / DENSE_RANK / PARTITION BY / LAG / LEAD）
- Expression（CASE / COALESCE / NULL）
- recursive CTE
- Mutation 問題の追加（基盤は MVP で作る、問題は後）
- Dataset 追加: company / sns

### ゲーム性（企画書 §16）

- 🔥 streak 表示
- Accuracy / 平均解答時間の表示
- 「もう一問だけ」を起こす最小限の演出（大きな演出は不要）

### 学習補助

- ER 図表示: schema.sql の `CREATE TABLE` / `REFERENCES` を正規表現で拾い、Mermaid `erDiagram` テキストへ純関数で変換して SchemaViewer に「ER 図」タブとして出す（DB 定義 → 図の変換が関数的にできる想定。優先度低）
- SchemaViewer に SELECT 補完用のテーブル・列名を渡す（CodeMirror lang-sql の `schema` オプション）

### 性能・基盤

- seed が大きくなったら事前生成 SQLite DB を deserialize する方式へ切替（企画書 §6）
- 静的ホスティング先の選定（Cloudflare Pages / GitHub Pages など）
