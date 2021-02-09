module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

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

  }
}
