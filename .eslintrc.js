module.exports = {
  root: true,
  extends: [
    '@cyansalt',
  ],
  globals: {
    __webpack_require__: true,
    __non_webpack_require__: true,
  },
  ignorePatterns: [
    '.eslintrc.js',
    "examples",
  ],
}
