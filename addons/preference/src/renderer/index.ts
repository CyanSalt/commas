import * as commas from 'commas:api/renderer'
import PreferencePane from './PreferencePane.vue'
import type { PreferenceItem } from './preference'

declare module '../../../../api/modules/context' {
  export interface Context {
    'preference.item': PreferenceItem,
  }
}

export default () => {

  commas.workspace.registerTabPane('preference', {
    title: 'Preferences#!preference.1',
    component: PreferencePane,
    icon: {
      name: 'ph-bold ph-gear',
    },
  })

  commas.ipcRenderer.on('open-preference-pane', () => {
    commas.workspace.openPaneTab('preference')
  })

}
