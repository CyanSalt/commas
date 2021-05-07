import * as bundler from '../../api/modules/bundler'

bundler.connect(require.context('../../addons/', true, /\/main\/.+\.ts$/))
