module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.i18n.addTranslations([
      { locale: 'zh-CN', file: require.resolve('./locales/zh-CN.json') },
    ])

  } else {

    commas.workspace.registerTabPane('theme', {
      title: 'Theme#!theme.1',
      component: commas.bundler.extract('theme/theme-pane.vue').default,
      icon: {
        name: 'feather-icon icon-feather',
      },
    })

    commas.reactive.provide('settings', {
      component: commas.bundler.extract('theme/theme-link.vue').default,
      group: 'general',
    })

    commas.reactive.provide('user-settings:terminal.addon.includes', {
      value: 'theme',
      note: 'Download theme from GitHub#!theme.4',
    })

  }
}
