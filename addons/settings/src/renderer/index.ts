import * as path from 'path'
import * as commas from 'commas:api/renderer'
import SettingsLink from './SettingsLink.vue'
import SettingsPane from './SettingsPane.vue'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

commas.workspace.registerTabPane('settings', {
  title: 'Settings#!settings.1',
  component: SettingsPane,
  icon: {
    name: 'feather-icon icon-sliders',
  },
})

commas.context.provide('preference', {
  component: SettingsLink,
  group: 'general',
})
