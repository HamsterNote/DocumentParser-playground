/* eslint config: ESLint + TypeScript + React, integrated with Prettier */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true }
  },
  settings: {
    react: { version: "detect" }
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "react-hooks",
    "jsx-a11y",
    "prettier"
  ],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:prettier/recommended" // Enables eslint-plugin-prettier and displays Prettier issues as ESLint errors
  ],
  rules: {
    // React 17+ JSX transform
    "react/react-in-jsx-scope": "off",
    // We use TypeScript for types
    "react/prop-types": "off",
    // Prefer TS-aware unused vars rule
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }
    ],
    // Let Prettier handle formatting
    "prettier/prettier": "error"
  },
  overrides: [
    {
      files: ["*.config.*", "*.cjs"],
      env: { node: true }
    },
    {
      files: ["**/*.ts", "**/*.tsx"],
      parserOptions: {
        // Keep fast rules; type-aware rules can be enabled later if needed
      }
    }
  ]
};
