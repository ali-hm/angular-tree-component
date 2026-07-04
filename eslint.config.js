// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@angular-eslint/component-selector': 'off',
      '@angular-eslint/directive-selector': 'off',
      '@angular-eslint/no-output-native': 'off',
      '@angular-eslint/no-output-on-prefix': 'off',
      '@angular-eslint/no-output-rename': 'off',
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/template/click-events-have-key-events': 'off',
      '@angular-eslint/template/interactive-supports-focus': 'off',
      '@angular-eslint/template/mouse-events-have-key-events': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/prefer-function-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      'prefer-const': 'off',
      'no-prototype-builtins': 'off',
      'no-var': 'off'
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {
      '@angular-eslint/template/click-events-have-key-events': 'off',
    '@angular-eslint/template/interactive-supports-focus': 'off',
    '@angular-eslint/template/mouse-events-have-key-events': 'off',
    },
  }
]);
