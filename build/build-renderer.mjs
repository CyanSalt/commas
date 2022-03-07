import { builtinModules } from 'module'
import vue from '@vitejs/plugin-vue'
import vite from 'vite'
import importGlob from './plugins/rollup/import-glob.mjs'

export default (versions) => vite.build({
  configFile: false,
  envFile: false,
  root: 'renderer',
  base: './',
  define: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    __VUE_OPTIONS_API__: JSON.stringify(false),
    // Optimization
    'process.type': JSON.stringify('renderer'),
  },
  plugins: [
    vue({
      reactivityTransform: true,
    }),
    importGlob(),
  ],
  json: {
    stringify: true,
  },
  build: {
    target: `chrome${versions.chrome.split('.')[0]}`,
    assetsDir: '.',
    cssCodeSplit: false,
    minify: false,
    rollupOptions: {
      external: [
        /^commas:/,
        'electron',
        ...builtinModules,
      ],
      output: {
        format: 'cjs',
        freeze: false,
      },
    },
    commonjsOptions: {
      ignore: [
        id => /^commas:/.test(id),
        'electron',
        ...builtinModules,
      ],
    },
  },
})
