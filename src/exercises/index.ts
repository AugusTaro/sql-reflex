/**
 * 問題レジストリ。`src/exercises/<category>/*.ts` を自動収集する。
 * 問題を追加するときはファイルを置くだけでよく、ここを編集する必要はない。
 * 各ファイルは `Exercise[]` を default export する（docs/問題の追加方法.md 参照）。
 */
import { sortExercises } from "../domain/exercise/select";
import type { Exercise } from "../domain/exercise/types";

// *.spec.ts はブラウザバンドルに混入させない
const modules = import.meta.glob<{ default: Exercise[] }>(["./*/*.ts", "!./**/*.spec.ts"], {
  eager: true,
});

export const exercises: Exercise[] = sortExercises(
  Object.keys(modules)
    .sort()
    .flatMap((path) => modules[path]?.default ?? []),
);
