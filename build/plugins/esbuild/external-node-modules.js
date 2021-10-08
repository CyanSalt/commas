const externalNodeModules = () => ({
  name: 'external-node-modules',
  setup(pluginBuild) {
    const filter = /^[^./]|^\.[^./]|^\.\.[^/]/
    pluginBuild.onResolve({ filter }, args => ({ path: args.path, external: true }))
  },
})

module.exports = externalNodeModules
