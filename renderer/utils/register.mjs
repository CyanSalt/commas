const noConflictModule = __non_webpack_require__('../api/modules/module')

const aliases = Object.create(null)
Object.assign(aliases, {
  vue: './node_modules/vue/dist/vue.esm-bundler.js',
  'lodash-es': './node_modules/lodash-es/lodash.js',
})
noConflictModule.setAliases(aliases)

const importAll = request => request.keys().forEach(request)
importAll(require.context('../internal/', true, /\.(mjs|css|vue)$/))

noConflictModule.setCache(require.cache)
