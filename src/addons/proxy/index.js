import ProxyPanel from './proxy-panel'
import ProxyAnchor from './proxy-anchor'
import ProxyStore from './store'

export default {
  install(hooks) {
    hooks.workspace.panel.register('proxy', {
      component: ProxyPanel,
      title: 'Proxy Rules#!23',
      icon: 'feather-icon icon-navigation',
    })
    hooks.workspace.anchor.add(ProxyAnchor)
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
