// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  // Ignore node_modules
  { ignores: ["**/node_modules/**", "lib/**"] },

  // Base JS recommendations
  js.configs.recommended,

  // TypeScript recommendations (no type-aware rules for simplicity)
  ...tseslint.configs.recommended,

  // Language options
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
);
