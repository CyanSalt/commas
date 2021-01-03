import * as bundler from '../../api/modules/bundler'

bundler.connect(require.context('./', true, /\.ts$/))
