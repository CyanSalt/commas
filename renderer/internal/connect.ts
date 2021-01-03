import * as bundler from '../../api/modules/bundler'

bundler.connect(require.context('./', true, /\.(ts|css|vue)$/))

bundler.define({
  vue: require.resolve('vue'),
  'lodash-es': require.resolve('lodash-es'),
})
