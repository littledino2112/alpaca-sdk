module.exports = {
    parser: '@typescript-eslint/parser', // Specifies the ESLint parser
    parserOptions: {
      ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
      sourceType: 'module', // Allows for the use of imports
    },
    extends: [
      'prettier',
      // 'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
      // 'prettier/@typescript-eslint', // Uses eslint-config-prettier to disable ESLint rules from @typescript-eslint/eslint-plugin that would conflict with prettier
      // 'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
    ],
    rules: {
      // 'prettier/prettier': 'error',
    },
  }
  /**
   * on vscode settings
   * {
   *  "eslint.validate": [
        {
          "language": "vue",
          "autoFix": true
        },
        {
          "language": "javascript",
          "autoFix": true
        },
        {
          "language": "javascriptreact",
          "autoFix": true
        }
      ],
      "eslint.autoFixOnSave": true,
      "editor.formatOnSave": false,
      "vetur.validation.template": false,
   * }
   */