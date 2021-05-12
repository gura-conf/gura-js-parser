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
    'prefer-const': 'error'
  }
}
