module.exports = {
  root: true,
  extends: [
    '@cyansalt/preset',
  ],
  ignorePatterns: [
    '.eslintrc.js',
    "examples",
  ],
  rules: {
    'vue/no-undef-components': 'error',
    'vue/no-undef-properties': 'error',
  },
}
