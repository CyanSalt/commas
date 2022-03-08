import path from 'path'
import * as commas from 'commas:api/main'
import { ipcMain } from 'electron'

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))

ipcMain.removeHandler('open-settings')

commas.ipcMain.handle('open-settings', event => {
  event.sender.send('open-preference-pane')
})

commas.app.onCleanup(() => {
  ipcMain.handle('open-settings', () => {
    return commas.settings.openSettingsFile()
  })
})