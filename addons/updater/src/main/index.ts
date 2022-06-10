import { stop } from '@vue/reactivity'
import * as commas from 'commas:api/main'
import { app, autoUpdater } from 'electron'
import { checkForUpdates, setupAutoUpdater, useAutoUpdaterEffect } from './updater'

declare module '../../../../src/typings/settings' {
  export interface Settings {
    'updater.polling.interval'?: number,
  }
}

export default () => {

  const supportsAutoUpdater = app.isPackaged && ['darwin', 'win32'].includes(process.platform)
  if (supportsAutoUpdater) {
  // Notification
    autoUpdater.on('update-downloaded', async (event, notes, name) => {
      const response = await commas.frame.notify({
        type: 'info',
        title: name,
        body: commas.i18n.translate('A new version has been downloaded. Restart the application to apply the updates.#!updater.1'),
        actions: [
          commas.i18n.translate('Restart#!updater.2'),
          commas.i18n.translate('Later#!updater.3'),
        ],
      })
      if (response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
    // Initialize
    setupAutoUpdater()
    // Enable checking automatically
    const reactiveEffect = useAutoUpdaterEffect()
    commas.app.onCleanup(() => {
      stop(reactiveEffect)
    })
  }

  commas.ipcMain.handle('check-for-updates', () => {
    if (supportsAutoUpdater) {
      checkForUpdates()
    }
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
