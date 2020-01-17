import Vue from 'vue'
import I18N from './plugins/i18n'
import FileStorage from './plugins/storage'
import App from './components/app'
import store from './store'
import hooks from './hooks'
import SettingsAddon from './addons/settings'
import ProxyAddon from './addons/proxy'
import ThemeAddon from './addons/theme'

Vue.use(I18N)
Vue.use(FileStorage)

hooks.addon.load(SettingsAddon)
hooks.addon.load(ProxyAddon)
hooks.addon.load(ThemeAddon)

new Vue({
  store,
  el: '#main',
  functional: true,
  render: h => h(App),
})
