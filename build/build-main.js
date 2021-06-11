const { build } = require('esbuild')
const fastglob = require('fast-glob')

const externalNodeModules = () => ({
  name: 'external-node-modules',
  setup(pluginBuild) {
    const filter = /^[^./]|^\.[^./]|^\.\.[^/]/
    pluginBuild.onResolve({ filter }, args => ({ path: args.path, external: true }))
  },
})

const importGlob = () => ({
  name: 'import-glob',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /\*/ }, args => ({
      path: args.path,
      namespace: 'import-glob',
      pluginData: {
        resolveDir: args.resolveDir,
      },
    }))
    pluginBuild.onLoad({ filter: /^/, namespace: 'import-glob' }, async (args) => {
      const files = await fastglob(args.path, { cwd: args.pluginData.resolveDir })
      files.sort()
      const contents = `
        ${files.map((module, index) => `import * as module$${index} from '${module}'`).join(';')}
        export default {${files.map((module, index) => `"${module}": module$${index}`).join(',')}}
      `
      return { contents, resolveDir: args.pluginData.resolveDir }
    })
  },
})

module.exports = () => build({
  entryPoints: ['main/index.ts'],
  outfile: 'main/dist/index.js',
  bundle: true,
  platform: 'node',
  plugins: [
    externalNodeModules(),
    importGlob(),
  ],
})
