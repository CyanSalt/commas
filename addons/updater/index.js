/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')
    const { stop } = require('@vue/reactivity')
    const { app, autoUpdater } = require('electron')
    const { setupAutoUpdater, useAutoUpdaterEffect } = commas.bundler.extract('updater/main/updater.ts')

    if (app.isPackaged && ['darwin', 'win32'].includes(process.platform)) {
      // Notification
      autoUpdater.on('update-downloaded', async (event, notes, name) => {
        const response = await commas.frame.notify({
          title: name,
          body: commas.i18n.translate('A new version has been downloaded. Restart the application to apply the updates.#!updater.1'),
          actions: [
            commas.i18n.translate('Restart#!updater.2'),
            commas.i18n.translate('Later#!updater.3'),
          ],
        })
        if (response === 0) autoUpdater.quitAndInstall()
      })
      // Initialize
      setupAutoUpdater()
      // Enable checking automatically
      const reactiveEffect = useAutoUpdaterEffect()
      commas.app.onCleanup(() => {
        stop(reactiveEffect)
      })
    }

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    // pass

  }
}
