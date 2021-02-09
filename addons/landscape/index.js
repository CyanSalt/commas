module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.workspace.addSlot(
      commas.bundler.extract('landscape/landscape-slot.vue').default
    )

    commas.workspace.addAnchor(
      commas.bundler.extract('landscape/landscape-anchor.vue').default
    )

    commas.reactive.provide('user-settings:terminal.addon.includes', {
      value: 'landscape',
      note: 'Add background image for each terminal tab#!landscape.1',
    })

  }
}
