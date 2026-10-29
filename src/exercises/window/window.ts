import type { Exercise } from "../../domain/exercise/types";

/** ウィンドウ関数。行を残したまま順位・累計・前後の行を計算する */
const exercises: Exercise[] = [
  {
    id: "win-001",
    title: "価格の高い順に連番",
    prompt:
      "全商品を price の降順に並べ、順位（1 から始まる連番）、name、price を取得してください。列はこの順とします。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Window", "ROW_NUMBER"],
    type: "query",
    solutionSql: `
      SELECT ROW_NUMBER() OVER (ORDER BY price DESC), name, price
      FROM products
      ORDER BY price DESC
    `,
    orderMatters: true,
    hints: ["ROW_NUMBER() OVER (ORDER BY ...) で連番を振れます"],
  },
  {
    id: "win-002",
    title: "在庫数の順位（同順位あり）",
    prompt:
      "全商品について name, stock と、stock の多い順の順位（同じ stock は同順位で、次の順位は飛ばす）を取得してください。列はこの順とします。",
    datasetId: "ecommerce",
    difficulty: 1,
    tags: ["Window", "RANK"],
    type: "query",
    solutionSql: "SELECT name, stock, RANK() OVER (ORDER BY stock DESC) FROM products",
    hints: ["RANK() は同順位の次を飛ばします。DENSE_RANK() は飛ばしません"],
  },
  {
    id: "win-003",
    title: "カテゴリ内での価格順位",
    prompt:
      "全商品について category_id, name, price と、同じ category_id の中で price の高い順に付けた連番を取得してください。列はこの順とします。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Window", "PARTITION BY"],
    type: "query",
    solutionSql: `
      SELECT category_id, name, price,
             ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC)
      FROM products
    `,
    hints: ["PARTITION BY でグループを分け、その中で ORDER BY します"],
  },
  {
    id: "win-004",
    title: "注文件数の累計",
    prompt:
      "全注文を ordered_at の昇順に並べ、id, ordered_at と、その注文までの累計件数を取得してください。列はこの順とします。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Window", "累計"],
    type: "query",
    solutionSql: `
      SELECT id, ordered_at, COUNT(*) OVER (ORDER BY ordered_at)
      FROM orders
      ORDER BY ordered_at
    `,
    orderMatters: true,
    hints: ["集約関数に OVER (ORDER BY ...) を付けると、その行までの累計になります"],
  },
  {
    id: "win-005",
    title: "直前の注文日",
    prompt:
      "全注文を ordered_at の昇順に並べ、id, ordered_at と、1 つ前の注文の ordered_at（最初の行は NULL）を取得してください。列はこの順とします。",
    datasetId: "ecommerce",
    difficulty: 2,
    tags: ["Window", "LAG"],
    type: "query",
    solutionSql: `
      SELECT id, ordered_at, LAG(ordered_at) OVER (ORDER BY ordered_at)
      FROM orders
      ORDER BY ordered_at
    `,
    orderMatters: true,
    hints: ["LAG(列) は 1 つ前の行の値、LEAD(列) は 1 つ後の行の値を返します"],
  },
];

export default exercises;
