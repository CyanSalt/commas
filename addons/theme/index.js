module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.i18n.addTranslation(['zh', 'zh-CN'], require('./locales/zh-CN.json'))

  } else {

    commas.workspace.registerTabPane('theme', {
      title: 'Theme#!theme.1',
      component: commas.module.require('internal/theme/theme-pane.vue').default,
      icon: {
        name: 'feather-icon icon-feather',
      },
    })

    commas.storage.shareDataIntoArray('settings', {
      component: commas.module.require('internal/theme/theme-link.vue').default,
      group: 'general',
    })

  }
}
