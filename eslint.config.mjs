import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import jest from "eslint-plugin-jest";
import globals from "globals";

export default [
  eslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.es2022,
        ...globals.node,
      },
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          vars: "all",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["index.test.js"],
    ...jest.configs["flat/recommended"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
      "jest/expect-expect": "off",
    },
  },
  prettierConfig,
  {
    ignores: [
      "package.json",
      "node_modules/*",
      ".yarn/*",
      "test/*",
      "coverage/*",
    ],
  },
];
