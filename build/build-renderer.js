const { builtinModules } = require('module')
const path = require('path')
const vue = require('@vitejs/plugin-vue')
const fastglob = require('fast-glob')
const { build } = require('vite')

const importGlob = () => ({
  name: 'import-glob',
  enforce: 'pre',
  resolveId(source, importer) {
    if (!source.includes('*')) return null
    return {
      id: source,
      meta: { 'import-glob': { importer } },
    }
  },
  async load(id) {
    if (!id.includes('*')) return null
    const meta = this.getModuleInfo(id).meta['import-glob']
    if (!meta) return null
    const cwd = path.dirname(meta.importer)
    const files = await fastglob(id, { cwd })
    return `
      ${files.map((module, index) => `import * as module$${index} from '${path.resolve(cwd, module)}'`).join(';')}
      export default {${files.map((module, index) => `"${module}": module$${index}`).join(',')}}
    `
  },
})

const wrapIIFE = () => ({
  name: 'wrap-iife',
  generateBundle(options, bundle) {
    for (const chunk of Object.values(bundle)) {
      if (chunk.code) {
        chunk.code = `(function(){\n${chunk.code}\n})()`
      }
    }
  },
})

module.exports = () => build({
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
    wrapIIFE(),
  ],
  json: {
    stringify: true,
  },
  build: {
    assetsDir: '.',
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
    lib: {
      entry: 'app.ts',
      formats: ['cjs'],
      fileName: 'app',
    },
  },
})
