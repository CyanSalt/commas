/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')
    const { ipcMain } = require('electron')

    ipcMain.handle('get-cache-size', event => {
      return event.sender.session.getCacheSize()
    })

    ipcMain.handle('clear-cache', event => {
      event.sender.session.clearCache()
    })

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.context.provide('preference', {
      component: commas.bundler.extract('cleaner/renderer/cleaner-link.vue').default,
      group: 'about',
    })

  }
}
