import { usePreferredDark } from '@vueuse/core'
import * as commas from 'commas:api/renderer'
import ThemeLink from './ThemeLink.vue'
import ThemePane from './ThemePane.vue'

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('theme', {
    title: 'Theme#!theme.1',
    component: ThemePane,
  })

  commas.context.provide('preference.item', {
    component: ThemeLink,
    group: 'general',
  })

  const isDark = $(usePreferredDark())

  commas.app.effect(() => {
    commas.context.provide('settings.item', {
      component: ThemeLink,
      key: isDark ? 'terminal.theme.name' : 'terminal.theme.lightName',
    })
    commas.context.provide('settings.item', {
      component: ThemeLink,
      key: isDark ? 'terminal.theme.customization' : 'terminal.theme.lightCustomization',
    })
  })

}
