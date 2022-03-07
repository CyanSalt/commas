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
    'vue/no-setup-props-destructure': 'off',
    'vue/no-undef-properties': 'error',
  },
}
