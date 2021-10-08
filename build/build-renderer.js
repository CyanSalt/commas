const { builtinModules } = require('module')
const vue = require('@vitejs/plugin-vue')
const { build } = require('vite')
const dynamicRequire = require('./plugins/rollup/dynamic-require')
const importGlob = require('./plugins/rollup/import-glob')

module.exports = (versions) => build({
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
    vue(),
    importGlob(),
    dynamicRequire({
      moduleIds: [
        ...builtinModules,
        'electron',
      ],
    }),
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
        ...builtinModules,
        'electron',
      ],
      output: {
        freeze: false,
      },
    },
    commonjsOptions: {
      ignore: [
        ...builtinModules,
        'electron',
      ],
    },
  },
})
