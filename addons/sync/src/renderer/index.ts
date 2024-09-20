import * as commas from 'commas:api/renderer'
import SyncLink from './SyncLink.vue'
import SyncPane from './SyncPane.vue'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('sync', {
    title: 'Sync#!sync.1',
    component: SyncPane,
  })

  commas.context.provide('preference.item', {
    component: SyncLink,
    group: 'general',
  })

}
