import * as commas from 'commas:api/renderer'
import CleanerLink from './CleanerLink.vue'

export default () => {

  commas.context.provide('preference.item', {
    component: CleanerLink,
    group: 'about',
  })

}
