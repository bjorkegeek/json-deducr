import { JsonArray, JsonObject, JsonValue } from "./types";
import { MD5 as hash } from "object-hash"; // Yes, MD5. Not cryptographic use
import equal from "fast-deep-equal";

/**
 * Performs a deep deduplication of a JSON value.
 * The returned value will be deep equal to the provided one,
 * but all equal objects in the tree will share the same instance.
 */
export function dedup(v: JsonValue): JsonValue {
  const memo = new Map<object, JsonValue>();
  const bucketByHash = new Map<ReturnType<typeof hash>, JsonValue[]>();

  return canonicalize(v);
  function canonicalize(v: JsonValue): JsonValue {
    if (v === null || typeof v !== "object") return v;
    const memoHit = memo.get(v);
    if (memoHit !== undefined) {
      return memoHit;
    }
    const h = hash(v);
    const candidates = bucketByHash.get(h);
    let deduplicated: JsonValue;
    if (candidates === undefined) {
      deduplicated = deepCanonicalize(v);
      bucketByHash.set(h, [deduplicated]);
    } else {
      const find = candidates.find((ov) => equal(ov, v));
      /* istanbul ignore if */
      if (find === undefined) {
        deduplicated = deepCanonicalize(v);
        candidates.push(deduplicated);
      } else {
        return find;
      }
    }
    memo.set(v, deduplicated);
    return deduplicated;
  }

  function deepCanonicalize(v: JsonArray | JsonObject) {
    if (Array.isArray(v)) {
      return v.map(canonicalize);
    } else {
      const ret: JsonObject = {};
      for (const k of Object.keys(v)) {
        ret[k] = canonicalize(v[k]);
      }
      return ret;
    }
  }
}
