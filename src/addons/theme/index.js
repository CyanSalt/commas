import ThemePanel from './theme-panel'
import ThemeLink from './theme-link'

export default {
  install(hooks) {
    hooks.workspace.panel.register('theme', {
      component: ThemePanel,
      title: 'Theme#!27',
      icon: 'feather-icon icon-feather',
      i18n: true,
    })
    hooks.addon.data.add('settings', {
      component: ThemeLink,
      group: 'general',
    })
  },
}
