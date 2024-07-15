import { ipcMain } from '@commas/electron-ipc'
import * as commas from 'commas:api/main'
import { shell } from 'electron'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'open-preference-website': () => void,
  }
}

export default () => {

  ipcMain.removeHandler('open-settings')
  commas.context.removeHandler('global:open-settings')

  commas.ipcMain.handle('open-settings', event => {
    commas.frame.send(event.sender, 'open-preference-pane')
  })

  const focusedWindow = $(commas.frame.useFocusedWindow())
  commas.context.handle('global:open-settings', () => {
    if (focusedWindow) {
      commas.frame.send(focusedWindow.webContents, 'open-preference-pane')
    }
  })

  commas.app.onCleanup(() => {
    ipcMain.handle('open-settings', async () => {
      await commas.settings.openSettingsFile()
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
