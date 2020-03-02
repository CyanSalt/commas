import locales from './locales.json'
import ThemePanel from './theme-panel'
import ThemeLink from './theme-link'

export default {
  install(hooks) {
    hooks.i18n.addTranslations(locales)
    hooks.workspace.panel.register('theme', {
      component: ThemePanel,
      title: 'Theme#!theme.1',
      icon: 'feather-icon icon-feather',
      i18n: true,
    })
    hooks.addon.data.add('settings:slots', {
      component: ThemeLink,
      group: 'general',
    })
  },
}
