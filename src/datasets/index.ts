/**
 * Dataset レジストリ。schema.sql / seed.sql を Vite の ?raw import で文字列として読み込む。
 * Dataset を追加するときは <id>/schema.sql と <id>/seed.sql を置いてここに 1 行足す。
 */
import type { Dataset } from "../domain/dataset/types";
import ecommerceSchema from "./ecommerce/schema.sql?raw";
import ecommerceSeed from "./ecommerce/seed.sql?raw";

export const datasets: Record<string, Dataset> = {
  ecommerce: {
    id: "ecommerce",
    name: "EC サイト（users / categories / products / orders / order_items）",
    schemaSql: ecommerceSchema,
    seedSql: ecommerceSeed,
  },
};

export const findDataset = (datasetId: string): Dataset => {
  const dataset = datasets[datasetId];
  if (!dataset) {
    throw new Error(`Dataset が見つかりません: ${datasetId}`);
  }
  return dataset;
};
