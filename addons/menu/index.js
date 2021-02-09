module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.reactive.provide('user-settings:terminal.addon.includes', {
      value: 'menu',
      note: 'Provide translations for the application menu on macOS#!menu.1',
    })

  }
}
