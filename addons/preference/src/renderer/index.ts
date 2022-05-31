import * as commas from 'commas:api/renderer'
import PreferencePane from './PreferencePane.vue'

export default () => {

  commas.workspace.registerTabPane('preference', {
    title: 'Preferences#!preference.1',
    component: PreferencePane,
    icon: {
      name: 'feather-icon icon-settings',
    },
  })

  commas.ipcRenderer.on('open-preference-pane', () => {
    commas.workspace.openPaneTab('preference')
  })

}
