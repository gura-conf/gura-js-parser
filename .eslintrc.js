module.exports = {
  env: {
    browser: true,
    es2015: true,
    node: true,
    jest: true
  },
  extends: [
    'standard',
    'standard-jsdoc/ts'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    'prefer-const': 'error',
    // Both lines below fixes unused enum warning (see https://github.com/typescript-eslint/typescript-eslint/issues/2621)
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  }
}
