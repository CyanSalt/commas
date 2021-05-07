import * as bundler from '../../api/modules/bundler'

bundler.connect(require.context('../../addons/', true, /\/renderer\/.+\.(ts|css|vue)$/))

bundler.define({
  vue: require.resolve('vue'),
})
