/**
 * 問題データの機械検証。問題を追加したら `pnpm test` を通せば整合性が保証される。
 * 実 SQLite を使うため src/sqlite/ に置く（src/exercises/ は SQLite 実装を import しない。企画書 §19）。
 * - 形式: id 重複なし / datasetId 存在 / type に応じた必須フィールド
 * - 実行: 実 SQLite で solutionSql が成功する。mutation は solutionSql → verifySql が真になる
 */
import { describe, expect, it } from "vitest";
import { datasets, findDataset } from "../datasets";
import { toSetupSql } from "../domain/dataset/types";
import type { Exercise } from "../domain/exercise/types";
import { isVerifyPassed } from "../domain/grading/mutation";
import { exercises } from "../exercises";
import { createDatabase, type SqlDatabase } from "./database";

describe("問題データの形式", () => {
  it("1 問以上ある", () => {
    expect(exercises.length).toBeGreaterThan(0);
  });

  it("id が重複していない", () => {
    const ids = exercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(exercises)("$id: 必須フィールドが揃っている", (exercise) => {
    expect(exercise.title).not.toBe("");
    expect(exercise.prompt).not.toBe("");
    expect(exercise.tags.length).toBeGreaterThan(0);
    expect(
      datasets[exercise.datasetId],
      `datasetId ${exercise.datasetId} が存在しない`,
    ).toBeDefined();
    if (exercise.type === "query") {
      expect(exercise.solutionSql, "query 問題には solutionSql が必要").toBeTruthy();
    } else {
      expect(exercise.verifySql, "mutation 問題には verifySql が必要").toBeTruthy();
      expect(exercise.solutionSql, "mutation 問題にも模範解答 solutionSql が必要").toBeTruthy();
    }
  });
});

describe("問題データの実行", () => {
  const queryExercises = exercises.filter((e) => e.type === "query");
  const mutationExercises = exercises.filter((e) => e.type === "mutation");

  const required = (value: string | undefined, label: string): string => {
    if (!value) throw new Error(`${label} がありません`);
    return value;
  };

  /** 問題の Dataset を流した新品 DB で fn を実行し、必ず破棄する */
  const withExerciseDb = async <T>(exercise: Exercise, fn: (db: SqlDatabase) => T): Promise<T> => {
    const db = await createDatabase();
    try {
      db.execute(toSetupSql(findDataset(exercise.datasetId)));
      return fn(db);
    } finally {
      db.close();
    }
  };

  it.each(queryExercises)("$id: solutionSql が実行でき 1 列以上返す", async (exercise) => {
    const result = await withExerciseDb(exercise, (db) =>
      db.execute(required(exercise.solutionSql, "solutionSql")),
    );
    expect(result.columns.length).toBeGreaterThan(0);
    expect(result.rows.length, "期待結果が 0 行の問題は解答が一意に定まらない").toBeGreaterThan(0);
  });

  it.each(mutationExercises)("$id: 初期状態では verifySql が偽", async (exercise) => {
    const verified = await withExerciseDb(exercise, (db) =>
      db.execute(required(exercise.verifySql, "verifySql")),
    );
    expect(isVerifyPassed(verified)).toBe(false);
  });

  it.each(mutationExercises)("$id: solutionSql 実行後は verifySql が真", async (exercise) => {
    const verified = await withExerciseDb(exercise, (db) => {
      db.execute(required(exercise.solutionSql, "solutionSql"));
      return db.execute(required(exercise.verifySql, "verifySql"));
    });
    expect(isVerifyPassed(verified)).toBe(true);
  });
});
