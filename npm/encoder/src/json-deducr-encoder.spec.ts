import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { decode } from "json-deducr-decoder";
import { encode } from "./json-deducr-encoder";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe("encode function", () => {
  test("Normal operation", () => {
    const original = JSON.parse(
      readFileSync(`${__dirname}/../../../test-data/original.json`, "utf8"),
    );
    const refCompressed = JSON.parse(
      readFileSync(`${__dirname}/../../../test-data/compressed.json`, "utf8"),
    );
    const encoded = encode(original);
    const decoded = decode(encoded);
    expect(decoded).deep.equals(original);
    expect(JSON.stringify(encoded).length).lessThanOrEqual(
      JSON.stringify(refCompressed).length,
    );
  });
  test("Trivial values", () => {
    expect(encode("scoop")).deep.equals({".": "scoop"});
    expect(encode(null)).deep.equals({".": null});
  });
});
