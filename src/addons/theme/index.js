import ThemePanel from './theme-panel'

export default {
  install(hooks) {
    hooks.workspace.panel.register('theme', {
      component: ThemePanel,
      title: 'Theme#!27',
      icon: 'feather-icon icon-feather',
    })
  },
}
