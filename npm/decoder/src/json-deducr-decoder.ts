export type JsonValue =
  | JsonObject
  | JsonArray
  | string
  | number
  | null
  | true
  | false;
export type JsonArray = JsonValue[];

export type JsonObject = {
  [s: string]: JsonValue;
};

export function decode(encoded: JsonObject): JsonValue {
  if (
    typeof encoded !== "object" ||
    encoded === null ||
    encoded["."] === undefined
  ) {
    throw new Error("Not a valid json-deducr compressed value");
  }
  return doDecode(".", encoded, {});
}

function doDecode(
  key: JsonValue,
  encodedValues: JsonObject,
  decodedValues: JsonObject
): JsonValue {
  if (typeof key === "object") {
    if (key === null) {
      return key;
    }
    let ret: JsonValue;
    if (key instanceof Array) {
      ret = key.map((x) => doDecode(x, encodedValues, decodedValues));
    } else {
      ret = doDecodeObject(key, encodedValues, decodedValues);
    }
    Object.freeze(ret);
    return ret;
  } else if (typeof key !== "string") {
    return key;
  } else {
    if (key.startsWith(".") && key !== ".") {
      return key.slice(1);
    }
    let decodedValue = decodedValues[key];
    if (decodedValue !== undefined) {
      return decodedValue;
    }
    const encodedValue = encodedValues[key];
    if (encodedValue === undefined) {
      throw new Error(
        `Invalid input data: Encoded value for ${key} not found!`
      );
    }
    if (typeof encodedValue !== 'object') {
      decodedValue = encodedValue;
    } else {
      decodedValue = doDecode(encodedValue, encodedValues, decodedValues);
      decodedValues[key] = decodedValue;
    }
    return decodedValue;
  }
}

function doDecodeObject(
  key: JsonObject,
  encodedValues: JsonObject,
  decodedValues: JsonObject
) {
  const ret: JsonObject = {};
  for (const k in key) {
    if (Object.prototype.hasOwnProperty.call(key, k)) {
      const outputKey = doDecode(k, encodedValues, decodedValues);
      if (typeof outputKey !== "string") {
        throw new Error(`Invalid input data: Expected string value for ${k}!`);
      }
      ret[outputKey] = doDecode(key[k], encodedValues, decodedValues);
    }
  }
  return ret;
}
