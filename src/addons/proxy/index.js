import locales from './locales.json'
import ProxyPanel from './proxy-panel'
import ProxyAnchor from './proxy-anchor'
import ProxyLink from './proxy-link'
import ProxyStore from './store'

export default {
  install(hooks) {
    hooks.i18n.addTranslations(locales)
    hooks.workspace.panel.register('proxy', {
      component: ProxyPanel,
      title: 'Proxy Rules#!proxy.1',
      icon: 'feather-icon icon-navigation',
      i18n: true,
    })
    hooks.workspace.anchor.add(ProxyAnchor)
    hooks.addon.data.add('settings:slots', {
      component: ProxyLink,
      group: 'feature',
    })
    hooks.events.on('ready', () => {
      const store = hooks.core.getStore()
      store.registerModule('proxy', ProxyStore)
      store.dispatch('proxy/load')
      store.dispatch('proxy/watch')
    })
    hooks.events.on('settings:loaded', () => {
      hooks.core.getStore().dispatch('proxy/loadSystem')
    })
    hooks.events.on('settings:reloaded', () => {
      hooks.core.getStore().dispatch('proxy/refresh')
    })
  },
}
