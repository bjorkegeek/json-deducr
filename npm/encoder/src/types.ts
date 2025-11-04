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
