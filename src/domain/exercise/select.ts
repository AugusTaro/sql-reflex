import type { Exercise } from "./types";

export const ALL_CATEGORIES = "all";

export const categoryOf = (exercise: Exercise): string => exercise.tags[0] ?? "Other";

/** UI に並べる推奨順。ここに無いカテゴリは末尾に名前順で続く */
const CATEGORY_ORDER = [
  "Basic",
  "JOIN",
  "Aggregate",
  "Set",
  "Subquery",
  "Window",
  "CTE",
  "Mutation",
  "DDL",
];

const categoryRank = (category: string): number => {
  const index = CATEGORY_ORDER.indexOf(category);
  return index === -1 ? CATEGORY_ORDER.length : index;
};

export const listCategories = (exercises: Exercise[]): string[] =>
  Array.from(new Set(exercises.map(categoryOf))).sort(
    (a, b) => categoryRank(a) - categoryRank(b) || a.localeCompare(b),
  );

export const filterByCategory = (exercises: Exercise[], category: string): Exercise[] =>
  category === ALL_CATEGORIES ? exercises : exercises.filter((e) => categoryOf(e) === category);

export const sortExercises = (exercises: Exercise[]): Exercise[] =>
  [...exercises].sort(
    (a, b) => a.difficulty - b.difficulty || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
  );

/**
 * 次の問題を選ぶ。
 * 現在の問題の次から順に未解答を探し、末尾に達したら先頭へ戻る。
 * 全問解答済みなら単純に次の問題（周回して復習できる）。
 */
export const pickNext = (
  list: Exercise[],
  currentId: string | undefined,
  solvedIds: ReadonlySet<string>,
): Exercise | undefined => {
  if (list.length === 0) return undefined;
  const currentIndex = currentId ? list.findIndex((e) => e.id === currentId) : -1;
  const rotated = [...list.slice(currentIndex + 1), ...list.slice(0, currentIndex + 1)];
  return rotated.find((e) => !solvedIds.has(e.id)) ?? rotated[0];
};
