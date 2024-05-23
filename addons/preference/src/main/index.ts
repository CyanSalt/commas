import * as commas from 'commas:api/main'
import { ipcMain, shell } from 'electron'

export default () => {

  ipcMain.removeHandler('open-settings')
  commas.context.removeHandler('global:open-settings')

  commas.ipcMain.handle('open-settings', event => {
    event.sender.send('open-preference-pane')
  })

  const focusedWindow = $(commas.frame.useFocusedWindow())
  commas.context.handle('global:open-settings', () => {
    if (focusedWindow) {
      focusedWindow.webContents.send('open-preference-pane')
    }
  })

  commas.app.onCleanup(() => {
    ipcMain.handle('open-settings', () => {
      return commas.settings.openSettingsFile()
    })
    commas.context.handle('global:open-settings', () => {
      return commas.settings.openSettingsFile()
    })
  })

  commas.ipcMain.handle('open-preference-website', () => {
    const manifest = commas.app.getManifest()
    shell.openExternal(manifest.homepage)
  })

  commas.i18n.addTranslationDirectory('locales')

}
