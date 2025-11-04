/// <reference types="vitest" />

import { defineConfig } from "vitest/config";
import preserveIstanbulComments from "./vite.plugins/preserve-istanbul-comments";

export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts"],
    globals: true, // so you can use describe/it/expect without imports
    environment: "node", // good default for pure algorithmic code
    coverage: {
      provider: "v8", // optional: remove if you don't need coverage
      reportsDirectory: "./coverage",
    },
  },
  plugins: [
    preserveIstanbulComments(), // only applied in tests
  ],
});
