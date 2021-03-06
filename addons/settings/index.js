module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.workspace.registerTabPane('settings', {
      title: 'Settings#!settings.1',
      component: commas.bundler.extract('settings/settings-pane.vue').default,
      icon: {
        name: 'feather-icon icon-sliders',
      },
    })

    commas.reactive.provide('preference', {
      component: commas.bundler.extract('settings/settings-link.vue').default,
      group: 'general',
    })

  }
}
