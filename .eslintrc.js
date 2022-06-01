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
    'vue/no-undef-components': 'error',
    'vue/no-undef-properties': 'error',
  },
  overrides: [
    {
      files: [
        '**/main/**/*.ts',
        '**/shared/**/*.ts',
      ],
      rules: {
        'no-restricted-imports': ['error', {
          paths: ['vue'],
        }],
      },
    },
    {
      files: [
        '!**/renderer/**/*.ts',
      ],
      rules: {
        'vue/prefer-import-from-vue': 'off',
      },
    }
  ],
}
