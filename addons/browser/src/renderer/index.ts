import * as commas from 'commas:api/renderer'
import BrowserPane from './BrowserPane.vue'
import { openBrowserTab } from './composition'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-browser': (url: string) => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('browser', {
    title: 'New Page#!browser.1',
    component: BrowserPane,
    volatile: true,
  })

  commas.context.handle('global-renderer:open-url', (url) => {
    openBrowserTab(url)
  })

  commas.ipcRenderer.on('open-browser', (event, url) => {
    openBrowserTab(url)
  })

  commas.context.provide('terminal.shell', {
    label: 'Web Page#!browser.3',
    command: 'open-pane',
    args: ['browser'],
  })

}
