import * as commas from 'commas:api/renderer'
import UpdaterLink from './updater-link.vue'

commas.context.provide('preference', {
  component: UpdaterLink,
  group: 'about',
})
