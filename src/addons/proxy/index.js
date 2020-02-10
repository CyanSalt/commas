import locales from './locales.json'
import ProxyPanel from './proxy-panel'
import ProxyAnchor from './proxy-anchor'
import ProxyLink from './proxy-link'
import ProxyStore from './store'

export default {
  install(hooks) {
    hooks.i18n.addTranslations(locales)
    hooks.settings.register({
      key: 'terminal.proxyServer.port',
      type: 'number',
      paradigm: [0, 65535],
      label: 'Proxy Server Port',
      comments: [
        'Specify HTTP port for development proxy server',
      ],
      default: 16383,
    })
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
    hooks.events.once('ready', () => {
      const store = hooks.core.getStore()
      store.registerModule('proxy', ProxyStore)
      store.dispatch('proxy/load')
      store.dispatch('proxy/watch')
    })
    hooks.events.once('settings:loaded', () => {
      hooks.core.getStore().dispatch('proxy/loadSystem')
    })
    hooks.events.on('settings:reloaded', () => {
      hooks.core.getStore().dispatch('proxy/refresh')
    })
  },
}
