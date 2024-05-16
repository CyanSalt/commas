import config from '@cyansalt/eslint-config'

export default config({
  configs: [
    {
      languageOptions: {
        parserOptions: {
          project: './tsconfig.tools.json',
        },
      },
      rules: {
        'vue/no-undef-components': 'error',
        'vue/no-undef-properties': 'error',
      },
    },
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
    },
  ],
})
