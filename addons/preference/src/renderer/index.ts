import * as commas from 'commas:api/renderer'
import PreferencePane from './PreferencePane.vue'
import type { PreferenceItem } from './preference'

declare module '@commas/api/modules/context' {
  export interface Context {
    'preference.item': PreferenceItem,
  }
}

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-preference-pane': () => void,
  }
}

export default () => {

  commas.workspace.registerTabPane('preference', {
    title: 'Preferences#!preference.1',
    component: PreferencePane,
    icon: {
      name: 'lucide-settings',
    },
  })

  commas.ipcRenderer.on('open-preference-pane', () => {
    commas.workspace.openPaneTab('preference')
  })

}
