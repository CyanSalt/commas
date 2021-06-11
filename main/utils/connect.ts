// @ts-expect-error import-glob
import modules from '../../addons/*/main/**.ts'
import * as bundler from '../../api/modules/bundler'

bundler.connect(modules, '../../addons/')
