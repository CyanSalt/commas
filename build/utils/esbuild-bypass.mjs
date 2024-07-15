import { createRequire } from 'node:module'

/**
 * @param {RegExp} filter
 * @returns {import('esbuild').Plugin}
 */
export default (filter) => ({
  name: 'esbuild-bypass',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter }, args => {
      const { resolve } = createRequire(args.importer)
      return { path: resolve(args.path) }
    })
  },
})
