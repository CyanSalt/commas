import * as vue from 'vue'
// @ts-expect-error import-glob
import modules from '../../addons/*/renderer/**.{ts,css,vue}'
import * as bundler from '../../api/modules/bundler'

bundler.connect(modules, '../../addons/')

bundler.connect({
  vue,
})
