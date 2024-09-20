import * as commas from 'commas:api/renderer'
import SettingsLink from './SettingsLink.vue'
import SettingsPane from './SettingsPane.vue'

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
