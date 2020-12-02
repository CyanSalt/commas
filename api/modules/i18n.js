const { translate, addTranslation, removeTranslation } = require('../../main/lib/i18n')

/**
 * @typedef {import('../../main/lib/i18n').Dictionary} Dictionary
 */

/**
 * @param {string[]} locales
 * @param {Dictionary} dictionary
 */
function noConflictAddTranslation(locales, dictionary) {
  addTranslation(locales, dictionary)
  this.$.app.onInvalidate(() => {
    removeTranslation(locales, dictionary)
  })
}

module.exports = {
  translate,
  addTranslation: noConflictAddTranslation,
}
