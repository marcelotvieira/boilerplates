import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [".next/**", "node_modules/**", "components/ui/**"],
  },
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "@stylistic": stylistic,
      react,
      "react-hooks": reactHooks,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Stylistic rules (formatting)
      "@stylistic/indent": ["error", 2],
      "@stylistic/quotes": ["error", "single"],
      "@stylistic/comma-dangle": ["error", "always-multiline"],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/array-bracket-spacing": ["error", "never"],
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/eol-last": ["error", "always"],
      "@stylistic/no-trailing-spaces": "error",
      "@stylistic/no-multiple-empty-lines": ["error", { max: 1 }],
      "@stylistic/no-multi-spaces": "error",
      "@stylistic/keyword-spacing": ["error", { before: true, after: true }],
      "@stylistic/space-before-blocks": "error",

      // Max line length (100 chars, ignoring URLs and strings)
      "@stylistic/max-len": ["error", {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true,
      }],

      // JSX formatting rules
      "@stylistic/jsx-quotes": ["error", "prefer-double"],
      "@stylistic/jsx-indent-props": ["error", 2],
      "@stylistic/jsx-first-prop-new-line": ["error", "multiline"],
      "@stylistic/jsx-max-props-per-line": ["error", { maximum: 1, when: "multiline" }],
      "@stylistic/jsx-closing-bracket-location": ["error", "line-aligned"],
      "@stylistic/jsx-closing-tag-location": "error",
      "@stylistic/jsx-wrap-multilines": ["error", {
        declaration: "parens-new-line",
        assignment: "parens-new-line",
        return: "parens-new-line",
        arrow: "parens-new-line",
        condition: "parens-new-line",
        logical: "parens-new-line",
        prop: "parens-new-line",
      }],
      "@stylistic/jsx-curly-newline": ["error", "consistent"],
      "@stylistic/jsx-curly-spacing": ["error", { when: "never", children: true }],
      "@stylistic/jsx-tag-spacing": ["error", {
        closingSlash: "never",
        beforeSelfClosing: "always",
        afterOpening: "never",
        beforeClosing: "never",
      }],

      // React rules
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      ...reactHooks.configs.recommended.rules,

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
    },
  }
);
