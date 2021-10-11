/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.context.provide('locales', {
      label: 'English',
      value: 'en-US',
    })

    commas.context.provide('locales', {
      label: 'Chinese (Simplified)',
      value: 'zh-CN',
    })

    commas.context.provide('preference', {
      component: commas.bundler.extract('menu/renderer/locale-selector.vue').default,
      group: 'customization',
    })

  }
}
