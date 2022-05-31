import * as commas from 'commas:api/renderer'
import ThemeLink from './ThemeLink.vue'
import ThemePane from './ThemePane.vue'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('theme', {
    title: 'Theme#!theme.1',
    component: ThemePane,
    icon: {
      name: 'feather-icon icon-feather',
    },
  })

  commas.context.provide('preference', {
    component: ThemeLink,
    group: 'general',
  })

}
