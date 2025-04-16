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
    {
      // FIXME: `@excalidraw/excalidraw` has error exports
      files: ['addons/paint/src/renderer/excalidraw.ts'],
      rules: {
        'import-x/no-duplicates': 'off',
        'import-x/order': 'off',
        'galaxy/import-extensions': 'off',
      },
    },
  ],
})
