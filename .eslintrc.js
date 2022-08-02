/* eslint-disable no-undef */
module.exports = {
  parserOptions: {
    ecmaVersion: 2017,
  },
  env: {
    node: true,
    es6: true,
  },
  extends: ["eslint:recommended", "plugin:jest/recommended"],
  rules: {
    "jest/expect-expect": "off",
    semi: ["error", "always"],
  },
};
