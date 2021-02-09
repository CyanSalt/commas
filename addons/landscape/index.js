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

  }
}
