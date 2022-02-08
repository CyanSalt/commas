/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.settings.addSettingsSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.context.provide(
      '@ui-slot',
      commas.bundler.extract('landscape/renderer/landscape-slot.vue').default,
    )

    commas.context.provide(
      '@ui-side-anchor',
      commas.bundler.extract('landscape/renderer/landscape-anchor.vue').default,
    )

  }
}
