import * as commas from 'commas:api/renderer'
import SettingsLink from './SettingsLink.vue'
import SettingsPane from './SettingsPane.vue'
import type { SettingsItem } from './utils'

declare module '@commas/api/modules/context' {
  export interface Context {
    'settings.item': SettingsItem,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('settings', {
    title: 'Settings#!settings.1',
    component: SettingsPane,
  })

  commas.context.provide('preference.item', {
    component: SettingsLink,
    group: 'general',
    priority: -1,
  })

}
