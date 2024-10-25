import * as commas from 'commas:api/renderer'
import AddonManagerLink from './AddonManagerLink.vue'
import AddonManagerPane from './AddonManagerPane.vue'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('addon-manager', {
    title: 'Addons#!addon-manager.1',
    component: AddonManagerPane,
  })

  commas.context.provide('preference.item', {
    component: AddonManagerLink,
    group: 'general',
  })

  commas.context.provide('settings.item', {
    component: AddonManagerLink,
    key: 'terminal.addon.includes',
  })

}
