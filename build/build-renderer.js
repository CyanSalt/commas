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

const dynamicRequire = ({ moduleIds }) => ({
  name: 'dynamic-require',
  enforce: 'post',
  transform(code) {
    const ast = this.parse(code)
    let lastIndex = 0
    let transformedCode = ''
    let dynamicRequireCode = ''
    let endIndex = 0
    const importDeclarations = ast.body
      .filter(statement => statement.type === 'ImportDeclaration')
    if (importDeclarations.length) {
      endIndex = importDeclarations[importDeclarations.length - 1].end
    }
    for (const statement of importDeclarations) {
      if (statement.type === 'ImportDeclaration') {
        const source = statement.source
        if (source.type === 'Literal' && moduleIds.includes(source.value)) {
          transformedCode = code.slice(lastIndex, statement.start)
          lastIndex = statement.end
          const namespaceSpecifier = statement.specifiers
            .find(specifier => specifier.type === 'ImportNamespaceSpecifier')
          if (namespaceSpecifier) {
            dynamicRequireCode += `\nconst ${namespaceSpecifier.local.name} = require(${source.raw});`
          }
          const normalSpecifiers = statement.specifiers
            .filter(specifier => specifier.type === 'ImportSpecifier')
          if (normalSpecifiers.length) {
            dynamicRequireCode += `\nconst { ${
              normalSpecifiers.map(specifier => (specifier.imported.name === specifier.local.name ? specifier.imported.name : `${specifier.imported.name}: ${specifier.local.name}`)).join(', ')
            } } = require(${source.raw});`
          }
        }
      }
    }
    if (dynamicRequireCode) {
      transformedCode += code.slice(lastIndex, endIndex)
      transformedCode += dynamicRequireCode
      transformedCode += code.slice(endIndex)
    } else {
      transformedCode += code.slice(lastIndex)
    }
    return transformedCode
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
    target: 'chrome91',
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
    commonjsOptions: {
      ignore: [
        ...builtinModules,
        'electron',
      ],
    },
    lib: {
      entry: 'app.ts',
      formats: ['es'],
      fileName: 'app',
    },
  },
})
