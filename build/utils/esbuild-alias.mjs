/**
 * @param {Record<string, string>} options
 * @returns {import('esbuild').Plugin}
 */
export default (options) => ({
  name: 'esbuild-alias',
  setup(pluginBuild) {
    const aliases = Object.keys(options)
    const filter = new RegExp(`^(?:${aliases.join('|')})$`)
    pluginBuild.onResolve({ filter }, args => ({ path: options[args.path], external: true }))
  },
})
