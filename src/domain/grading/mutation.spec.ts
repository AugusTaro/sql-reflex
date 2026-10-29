import { describe, expect, it } from "vitest";
import { isVerifyPassed } from "./mutation";

describe("isVerifyPassed", () => {
  it("全行の先頭列が真なら合格", () => {
    expect(isVerifyPassed({ columns: ["ok"], rows: [[1]] })).toBe(true);
    expect(isVerifyPassed({ columns: ["ok"], rows: [[1], [1]] })).toBe(true);
  });

  it("先頭列が 0 / NULL の行があれば不合格", () => {
    expect(isVerifyPassed({ columns: ["ok"], rows: [[0]] })).toBe(false);
    expect(isVerifyPassed({ columns: ["ok"], rows: [[1], [0]] })).toBe(false);
    expect(isVerifyPassed({ columns: ["ok"], rows: [[null]] })).toBe(false);
  });

  it("行が無ければ不合格（WHERE で対象が消えたケース）", () => {
    expect(isVerifyPassed({ columns: ["ok"], rows: [] })).toBe(false);
  });

  it("bigint の 1 も真として扱う", () => {
    expect(isVerifyPassed({ columns: ["ok"], rows: [[1n]] })).toBe(true);
    expect(isVerifyPassed({ columns: ["ok"], rows: [[0n]] })).toBe(false);
  });
});
