import { decode } from "./json-deducr-decoder";
import { readFileSync } from "fs";

describe("decode function", () => {
  test("Normal operation", () => {
    const compressed = JSON.parse(
      readFileSync(`${__dirname}/../../../test-data/compressed.json`, "utf8")
    );
    const original = JSON.parse(
      readFileSync(`${__dirname}/../../../test-data/original.json`, "utf8")
    );
    const decoded = decode(compressed);
    expect(decoded).toEqual(original);
  });
  test("Bad input", () => {
    const badInputs = [3, "foo", {}];
    badInputs.forEach((inp) => {
      expect(() => {
        decode(inp);
      }).toThrow();
    });
  });
  test("Missing key", () => {
    expect(() => {
      decode({ ".": { A: 3 } });
    }).toThrow();
  });
  test("Non-string key", () => {
    expect(() => {
      decode({ ".": { A: 3 }, A: 7 });
    }).toThrow();
  });
});
