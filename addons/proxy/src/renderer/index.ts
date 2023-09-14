import * as commas from 'commas:api/renderer'
import ProxyAnchor from './ProxyAnchor.vue'
import ProxyLink from './ProxyLink.vue'
import ProxyPane from './ProxyPane.vue'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('proxy', {
    title: 'Proxy#!proxy.1',
    component: ProxyPane,
    icon: {
      name: 'ph-navigation-arrow',
    },
  })

  commas.context.provide('terminal.ui-left-action-anchor', ProxyAnchor)

  commas.context.provide('preference.item', {
    component: ProxyLink,
    group: 'feature',
  })

}
