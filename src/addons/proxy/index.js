import ProxyPanel from './proxy-panel'
import ProxyAnchor from './proxy-anchor'

export default {
  install(hooks) {
    hooks.workspace.panel.register('proxy', {
      component: ProxyPanel,
      title: 'Proxy Rules#!23',
      icon: 'feather-icon icon-navigation',
    })
    hooks.workspace.anchor.add(ProxyAnchor)
  },
}
