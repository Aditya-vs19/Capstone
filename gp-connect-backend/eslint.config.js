import globals from "globals";

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      "indent": ["error", 2],
      "linebreak-style": ["error", "windows"],
      "quotes": ["error", "single"],
      "semi": ["error", "always"],
      "no-unused-vars": ["warn", { "argsIgnorePattern": "next" }],
      "no-console": "off",
    },
  },
];
