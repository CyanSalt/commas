module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.i18n.addTranslation(['zh', 'zh-CN'], require('./locales/zh-CN.json'))

  } else {

    commas.workspace.registerTabPane('theme', {
      title: 'Theme#!theme.1',
      component: commas.bundler.extract('theme/theme-pane.vue').default,
      icon: {
        name: 'feather-icon icon-feather',
      },
    })

    commas.reactive.shareDataIntoArray('settings', {
      component: commas.bundler.extract('theme/theme-link.vue').default,
      group: 'general',
    })

  }
}
