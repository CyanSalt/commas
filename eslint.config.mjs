import config from '@cyansalt/eslint-config'

export default config({
  react: false,
  configs: [
    {
      ignores: ['**/*.json'],
    },
    {
      languageOptions: {
        parserOptions: {
          project: './tsconfig.tools.json',
          extraFileExtensions: ['.vue'],
        },
      },
      rules: {
        'no-restricted-imports': ['error', {
          paths: [
            {
              name: 'electron',
              importNames: ['ipcMain', 'ipcRenderer'],
            },
          ],
        }],
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
          paths: [
            {
              name: 'electron',
              importNames: ['ipcMain', 'ipcRenderer'],
            },
            'vue',
          ],
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
