import { describe, expect, it } from "vitest";
import {
  createInitialProgress,
  loadProgress,
  type ProgressStorage,
  recordAttempt,
  saveProgress,
} from "./progress";

const memoryStorage = (): ProgressStorage & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
};

describe("recordAttempt", () => {
  it("正解で solved に記録され streak が伸びる", () => {
    const p1 = recordAttempt(createInitialProgress(), "a", true, "2026-01-01T00:00:00Z");
    const p2 = recordAttempt(p1, "b", true, "2026-01-01T00:01:00Z");
    expect(p2.solved.a).toEqual({ solvedAt: "2026-01-01T00:00:00Z", attempts: 1 });
    expect(p2.streak).toBe(2);
  });

  it("不正解で streak が 0 に戻り attempts だけ増える", () => {
    const p1 = recordAttempt(createInitialProgress(), "a", true, "t1");
    const p2 = recordAttempt(p1, "b", false, "t2");
    expect(p2.streak).toBe(0);
    expect(p2.solved.b).toBeUndefined();
    expect(p2.attempts.b).toBe(1);
  });

  it("同じ問題を再度正解しても最初の solvedAt を保つ", () => {
    const p1 = recordAttempt(createInitialProgress(), "a", true, "t1");
    const p2 = recordAttempt(p1, "a", true, "t2");
    expect(p2.solved.a?.solvedAt).toBe("t1");
    expect(p2.solved.a?.attempts).toBe(2);
  });

  it("元のオブジェクトを変更しない", () => {
    const p0 = createInitialProgress();
    recordAttempt(p0, "a", true, "t1");
    expect(p0.solved).toEqual({});
    expect(p0.streak).toBe(0);
  });
});

describe("saveProgress / loadProgress", () => {
  it("保存して読み戻せる", () => {
    const storage = memoryStorage();
    const progress = {
      ...recordAttempt(createInitialProgress(), "a", true, "t1"),
      lastExerciseId: "b",
      category: "JOIN",
    };
    saveProgress(progress, storage);
    expect(loadProgress(storage)).toEqual(progress);
  });

  it("保存が無ければ初期値", () => {
    expect(loadProgress(memoryStorage())).toEqual(createInitialProgress());
  });

  it("壊れた JSON は初期値にフォールバックする", () => {
    const storage = memoryStorage();
    storage.setItem("sql-reflex:progress:v1", "{not json");
    expect(loadProgress(storage)).toEqual(createInitialProgress());
  });

  it("storage が例外を投げても落ちない", () => {
    const broken: ProgressStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(loadProgress(broken)).toEqual(createInitialProgress());
    expect(() => saveProgress(createInitialProgress(), broken)).not.toThrow();
  });
});
