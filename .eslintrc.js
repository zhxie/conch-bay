module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/strict", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: `./tsconfig.json`,
  },
  plugins: ["@typescript-eslint"],
  overrides: [
    {
      files: ["*.js", "*.mjs"],
      env: {
        node: true,
      },
      globals: {
        fetch: "readonly",
      },
      parserOptions: {
        project: null,
      },
      rules: {
        "@typescript-eslint/await-thenable": "off",
        "@typescript-eslint/no-unnecessary-condition": "off",
        "@typescript-eslint/require-await": "off",
        "@typescript-eslint/switch-exhaustiveness-check": "off",
      },
    },
  ],
  rules: {
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/dot-notation": "off",
    "@typescript-eslint/no-duplicate-enum-values": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-require-imports": "off",
    "@typescript-eslint/no-unnecessary-condition": ["warn", { allowConstantLoopConditions: true }],
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/require-await": 2,
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "no-constant-condition": ["error", { checkLoops: false }],
    "no-unused-vars": "off",
  },
  root: true,
};
