module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

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

  }
}
