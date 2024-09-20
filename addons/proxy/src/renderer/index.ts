import * as commas from 'commas:api/renderer'
import ProxyAnchor from './ProxyAnchor.vue'
import ProxyLink from './ProxyLink.vue'
import ProxyPane from './ProxyPane.vue'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'configure-proxy': () => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('proxy', {
    title: 'Proxy#!proxy.1',
    component: ProxyPane,
  })

  commas.ipcRenderer.on('configure-proxy', () => {
    commas.workspace.openPaneTab('proxy')
  })

  commas.context.provide('terminal.ui-left-action-anchor', ProxyAnchor)

  commas.context.provide('preference.item', {
    component: ProxyLink,
    group: 'feature',
  })

}
