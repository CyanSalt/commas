import * as path from 'path'
import * as commas from 'commas:api/renderer'
import ThemeLink from './theme-link.vue'
import ThemePane from './theme-pane.vue'

commas.ui.addCSSFile(path.join(__dirname, '../../dist/renderer/style.css'))

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
