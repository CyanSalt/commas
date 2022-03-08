import * as path from 'path'
import * as commas from 'commas:api/renderer'
import ProxyAnchor from './proxy-anchor.vue'
import ProxyLink from './proxy-link.vue'
import ProxyPane from './proxy-pane.vue'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.workspace.registerTabPane('proxy', {
  title: 'Proxy#!proxy.1',
  component: ProxyPane,
  icon: {
    name: 'feather-icon icon-navigation',
  },
})

commas.context.provide('@ui-side-anchor', ProxyAnchor)

commas.context.provide('preference', {
  component: ProxyLink,
  group: 'feature',
})
