import * as commas from 'commas:api/renderer'
import AddonManagerLink from './AddonManagerLink.vue'
import AddonManagerPane from './AddonManagerPane.vue'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('addon-manager', {
    title: 'Addons#!addon-manager.1',
    component: AddonManagerPane,
    icon: {
      name: 'ph-puzzle-piece',
    },
  })

  commas.context.provide('preference.item', {
    component: AddonManagerLink,
    group: 'general',
  })

}
