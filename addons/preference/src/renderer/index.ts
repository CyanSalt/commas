import * as commas from 'commas:api/renderer'
import PreferencePane from './PreferencePane.vue'
import type { LanguageOption, PreferenceItem } from './preference'

declare module '@commas/api/modules/context' {
  export interface Context {
    'preference.item': PreferenceItem,
    'preference.locale': LanguageOption,
  }
}

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-preference-pane': () => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.context.provide('preference.locale', {
    label: 'English',
    value: 'en-US',
  })

  commas.context.provide('preference.locale', {
    label: '中文 (简体)',
    value: 'zh-CN',
  })

  commas.workspace.registerTabPane('preference', {
    title: 'Preferences#!preference.1',
    component: PreferencePane,
  })

  commas.ipcRenderer.on('open-preference-pane', () => {
    commas.workspace.openPaneTab('preference')
  })

}
