module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.i18n.addTranslations([
      { locale: 'zh-CN', file: require.resolve('./locales/zh-CN.json') },
    ])

  } else {

    commas.workspace.registerTabPane('user-settings', {
      title: 'User Settings#!user-settings.1',
      component: commas.bundler.extract('user-settings/user-settings-pane.vue').default,
      icon: {
        name: 'feather-icon icon-sliders',
      },
    })

    commas.reactive.provide('settings', {
      component: commas.bundler.extract('user-settings/user-settings-link.vue').default,
      group: 'general',
    })

    commas.reactive.provide('user-settings:terminal.addon.includes', {
      value: 'user-settings',
      note: 'User interface for user settings#!user-settings.3',
    })

  }
}
