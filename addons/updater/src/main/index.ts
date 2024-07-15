import * as commas from 'commas:api/main'
import { app, autoUpdater } from 'electron'
import { checkForUpdates, setupAutoUpdater, useAutoUpdaterEffect } from './updater'

declare module '@commas/types/settings' {
  export interface Settings {
    'updater.polling.interval'?: number,
  }
}

declare module '@commas/electron-ipc' {
  export interface Commands {
    'check-for-updates': () => void,
  }
}

export default () => {

  const supportsAutoUpdater = app.isPackaged && ['darwin', 'win32'].includes(process.platform)
  if (supportsAutoUpdater) {
    // Notification
    const handleUpdateDownloaded = async (event, notes, name) => {
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
    }
    autoUpdater.on('update-downloaded', handleUpdateDownloaded)
    // Initialize
    setupAutoUpdater()
    // Enable checking automatically
    const stop = useAutoUpdaterEffect()
    commas.app.onCleanup(() => {
      autoUpdater.off('update-downloaded', handleUpdateDownloaded)
      stop()
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
