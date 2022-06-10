import * as commas from 'commas:api/renderer'
import type { Component } from 'vue'
import PreferencePane from './PreferencePane.vue'

declare module '../../../../api/modules/context' {
  export interface Context {
    preference: {
      component: Component,
      group: string,
    },
  }
}

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
