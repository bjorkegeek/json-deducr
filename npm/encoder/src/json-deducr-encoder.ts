import { dedup } from "./dedup.js";
import { JsonObject, JsonValue } from "./types.js";

/**
 * Encodes any JSON object into json-deducr format
 * @param value
 */
export function encode(value: JsonValue) {
  // Handle trivial values
  switch (typeof value) {
    case "object":
      if (value !== null) {
        break;
      }
    // fall through
    case "number":
    case "boolean":
    case "string":
      return { ".": value };
  }
  // Pass 1: deduplicate
  value = dedup(value);
  // Pass 2: find objects with multiple references
  const multipleObjects = getMultipleObjects(value);
  // Pass 3: Assign keys to multiple objects
  const reverseMap = new Map<JsonValue, string>();
  for (const [index, obj] of multipleObjects.entries()) {
    const key = b64(index);
    reverseMap.set(obj, key);
  }
  // Pass 4: Encode objects into dictionary
  const ret = {} as JsonObject;
  for (const [subValue, key] of reverseMap.entries()) {
    ret[key] = encodeValueWorker(subValue, reverseMap, true);
  }
  ret["."] = encodeValueWorker(value, reverseMap, true);
  return ret;
}

function encodeValueWorker(
  value: string,
  reverseMap: Map<JsonValue, string>,
  root: boolean,
): string;
function encodeValueWorker(
  value: JsonValue,
  reverseMap: Map<JsonValue, string>,
  root: boolean,
): JsonValue;
function encodeValueWorker(
  value: JsonValue,
  reverseMap: Map<JsonValue, string>,
  root: boolean,
): JsonValue {
  if (!root) {
    const key = reverseMap.get(value);
    if (key) {
      return key;
    }
  }
  switch (typeof value) {
    case "string":
      return root ? value : "." + value;
    case "object":
      if (value !== null) {
        break;
      }
    // fall through
    case "number":
    case "boolean":
      return value;
  }
  if (Array.isArray(value)) {
    return value.map((v) => encodeValueWorker(v, reverseMap, false));
  }
  const ret = {} as JsonObject;
  for (const [key, subValue] of Object.entries(value)) {
    ret[encodeValueWorker(key, reverseMap, false)] = encodeValueWorker(
      subValue,
      reverseMap,
      false,
    );
  }
  return ret;
}

/**
 * Returns an array of all the sub-values that appear more than once in order
 * of count with the most prominent value returned first.
 */
function getMultipleObjects(value: JsonValue): JsonValue[] {
  const histogram = new Map<JsonValue, number>();
  visit(value);

  const pairs: [JsonValue, number][] = [];
  for (const [obj, count] of histogram.entries()) {
    if (count > 1) {
      pairs.push([obj, count]);
    }
  }
  pairs.sort((a, b) => b[1] - a[1]);
  return pairs.map(([v]) => v);

  function visit(value: JsonValue) {
    const count = histogram.get(value);
    if (count === undefined) {
      if (Array.isArray(value)) {
        value.forEach(visit);
      } else if (typeof value === "object" && value !== null) {
        for (const [key, subValue] of Object.entries(value)) {
          visit(key);
          visit(subValue);
        }
      }
      histogram.set(value, 1);
    } else if (typeof value !== "number" && typeof value !== "boolean") {
      histogram.set(value, count + 1);
    }
  }
}

const B64A = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function b64(i: number) {
  let r = "";
  do {
    const mine = i % B64A.length;
    i = Math.floor(i / B64A.length);
    r = B64A[mine] + r;
  } while (i);
  return r;
}
