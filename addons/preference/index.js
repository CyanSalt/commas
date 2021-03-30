/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')
    const { ipcMain } = require('electron')

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

    ipcMain.removeHandler('open-settings')

    commas.ipcMain.handle('open-settings', event => {
      event.sender.send('open-preference-pane')
    })

    commas.app.onCleanup(() => {
      ipcMain.handle('open-settings', () => {
        return commas.settings.openFile()
      })
    })

  } else {

    commas.workspace.registerTabPane('preference', {
      title: 'Preferences#!preference.1',
      component: commas.bundler.extract('preference/preference-pane.vue').default,
      icon: {
        name: 'feather-icon icon-settings',
      },
    })

    commas.ipcRenderer.on('open-preference-pane', () => {
      commas.workspace.openPaneTab('preference')
    })

  }
}
