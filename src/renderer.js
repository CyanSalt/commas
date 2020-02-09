import Vue from 'vue'
import App from './components/app'
import store from './store'
import hooks from './hooks'
import SettingsAddon from './addons/settings'
import ProxyAddon from './addons/proxy'
import UserSettingsAddon from './addons/user-settings'
import ThemeAddon from './addons/theme'
import UpdaterAddon from './addons/updater'
import {translateElement} from './utils/i18n'

hooks.addon.load(SettingsAddon)
hooks.addon.load(ProxyAddon)
hooks.addon.load(UserSettingsAddon)
hooks.addon.load(ThemeAddon)
hooks.addon.load(UpdaterAddon)

Vue.directive('i18n', translateElement)

new Vue({
  store,
  el: '#main',
  functional: true,
  render: h => h(App),
})
