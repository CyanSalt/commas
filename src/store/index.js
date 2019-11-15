import Vue from 'vue'
import Vuex from 'vuex'
import settings from './modules/settings'
import theme from './modules/theme'
import terminal from './modules/terminal'
import launcher from './modules/launcher'
import shell from './modules/shell'
import proxy from './modules/proxy'
import updater from './modules/updater'

Vue.use(Vuex)

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    settings,
    theme,
    terminal,
    launcher,
    shell,
    proxy,
    updater,
  },
})
