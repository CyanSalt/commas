import * as commas from 'commas:api/renderer'
import BrowserPane from './BrowserPane.vue'
import { openBrowserTab } from './composition'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('browser', {
    title: 'New Page#!browser.1',
    component: BrowserPane,
    volatile: true,
  })

  const defaultHandler = commas.context.removeHandler('global-renderer:open-url')

  commas.context.handle('global-renderer:open-url', (url) => {
    openBrowserTab(url)
  })

  if (defaultHandler) {
    commas.app.onCleanup(() => {
      commas.context.handle('global-renderer:open-url', defaultHandler)
    })
  }

}
