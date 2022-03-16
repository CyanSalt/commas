import * as commas from 'commas:api/renderer'
import UpdaterLink from './UpdaterLink.vue'

commas.context.provide('preference', {
  component: UpdaterLink,
  group: 'about',
})
