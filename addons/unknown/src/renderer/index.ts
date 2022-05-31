import * as commas from 'commas:api/renderer'
import UnknownPane from './UnknownPane.vue'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('unknown', {
    title: 'Battle#!unknown.1',
    component: UnknownPane,
    icon: {
      name: 'feather-icon icon-smile',
    },
  })

  commas.ipcRenderer.on('unknown-start', () => {
    commas.workspace.openPaneTab('unknown')
  })

}
