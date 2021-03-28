/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.context.provide(
      '@slot',
      commas.bundler.extract('landscape/landscape-slot.vue').default
    )

    commas.context.provide(
      '@anchor',
      commas.bundler.extract('landscape/landscape-anchor.vue').default
    )

  }
}
