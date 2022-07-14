/**
 * @returns {import('esbuild').Plugin}
 */
export default () => ({
  name: 'esbuild-external-node-modules',
  setup(pluginBuild) {
    const filter = /^[^./]|^\.[^./]|^\.\.[^/]/
    pluginBuild.onResolve({ filter }, args => ({ path: args.path, external: true }))
  },
})
