module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        // Allows the use of modern ECMAScript features
        ecmaVersion: 'latest',
        // Allows for the use of imports
        sourceType: 'module', 
    },
    extends: [
        // Uses the linting rules from @typescript-eslint/eslint-plugin
        'plugin:@typescript-eslint/recommended'
    ],
    env: {
        // Enable Node.js global variables
        node: true,
    },
    rules: {
        'no-console': 'off',
        'import/prefer-default-export': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
    },
}