import * as commas from 'commas:api/main'
import { ipcMain, shell } from 'electron'

export default () => {

  ipcMain.removeHandler('open-settings')

  commas.ipcMain.handle('open-settings', event => {
    event.sender.send('open-preference-pane')
  })

  commas.app.onCleanup(() => {
    ipcMain.handle('open-settings', () => {
      return commas.settings.openSettingsFile()
    })
  })

  commas.ipcMain.handle('open-preference-website', () => {
    const manifest = commas.app.getManifest()
    shell.openExternal(manifest.homepage)
  })

  commas.i18n.addTranslationDirectory('locales')

}
