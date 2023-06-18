module.exports = {
  extends: ["eslint:recommended", "plugin:@typescript-eslint/strict", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: `./tsconfig.json`,
  },
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/dot-notation": "off",
    "@typescript-eslint/no-duplicate-enum-values": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unnecessary-condition": ["warn", { checkLoops: false }],
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "@typescript-eslint/require-await": 2,
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "no-constant-condition": ["error", { checkLoops: false }],
    "no-unused-vars": "off",
  },
  root: true,
};
