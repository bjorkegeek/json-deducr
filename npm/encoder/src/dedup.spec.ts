import { dedup } from "./dedup";
import { JsonArray, JsonObject } from "./types";
import { expect } from "vitest";

describe("deduplication function", () => {
  test("primitive data types", () => {
    const str = "O hai";
    const num = 3.14;
    expect(dedup(str)).toBe(str);
    expect(dedup(num)).toBe(num);
    expect(dedup(true)).toBe(true);
    expect(dedup(false)).toBe(false);
    expect(dedup(null)).toBe(null);
  });
  test("mid level", () => {
    const data = {
      hey: [1, 2, 3, { what: "now?" }],
      ho: [1, 2, 3, { what: "now?" }],
    } as JsonObject;
    const dedupedData = dedup(data) as JsonObject;
    expect(dedupedData).toBeTypeOf("object");
    expect(dedupedData["hey"]).toBe(dedupedData["ho"]);
  });
  test("array", () => {
    const data = [
      [1, 2, 3, { what: "now?" }],
      [1, 2, 3, { what: "now?" }],
    ] as JsonArray;
    const dedupedData = dedup(data) as JsonArray;
    expect(dedupedData).toBeTypeOf("object");
    expect(dedupedData[0]).toBe(dedupedData[1]);
  });
  test("strange", () => {
    const data = {
      hey: [1, 2, 3, { what: "now?" }],
      ho: [1, 2, 3, { what: "now?" }],
      no: [3, 4, { really: ["really", [1, 2, 3, { what: "now?" }]] }],
    } as JsonObject;
    const dedupedData = dedup(data) as JsonObject;
    expect(dedupedData).toBeTypeOf("object");
    expect(dedupedData["hey"]).toBe(
      (
        ((dedupedData["no"] as JsonArray)[2] as JsonObject)[
          "really"
        ] as JsonArray
      )[1],
    );
  });
  test("memo", () => {
    const memo = [1, 2, 3];

    const data = {
      hey: memo,
      ho: memo,
    } as JsonObject;
    const dedupedData = dedup(data) as JsonObject;
    expect(dedupedData).toBeTypeOf("object");
    expect(dedupedData["hey"]).toBe(dedupedData["ho"]);
  });
});
