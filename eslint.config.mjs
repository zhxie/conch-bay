import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import prettier from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [".expo/", ".vscode/"],
  },
  js.configs.recommended,
  ...typescriptEslint.configs["flat/strict"],
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/dot-notation": "off",
      "@typescript-eslint/no-duplicate-enum-values": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unnecessary-condition": [
        "warn",
        { allowConstantLoopConditions: true },
      ],
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/require-await": "error",
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-unused-vars": "off",
      "no-useless-assignment": "off",
      "preserve-caught-error": "off",
    },
  },
  {
    files: ["**/*.{js,mjs}"],
    languageOptions: {
      globals: {
        ...globals.node,
        fetch: "readonly",
      },
      parserOptions: {
        project: false,
      },
    },
    rules: {
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/switch-exhaustiveness-check": "off",
    },
  },
  prettier,
];
