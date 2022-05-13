import * as path from 'path'
import * as commas from 'commas:api/renderer'
import ProxyAnchor from './ProxyAnchor.vue'
import ProxyLink from './ProxyLink.vue'
import ProxyPane from './ProxyPane.vue'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.workspace.registerTabPane('proxy', {
  title: 'Proxy#!proxy.1',
  component: ProxyPane,
  icon: {
    name: 'feather-icon icon-navigation',
  },
})

commas.context.provide('@ui-action-anchor', ProxyAnchor)

commas.context.provide('preference', {
  component: ProxyLink,
  group: 'feature',
})
