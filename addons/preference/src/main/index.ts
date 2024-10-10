import { ipcMain } from '@commas/electron-ipc'
import * as commas from 'commas:api/main'

export default () => {

  ipcMain.removeHandler('open-settings')
  const defaultHandler = commas.context.removeHandler('global-main:open-settings')

  commas.ipcMain.handle('open-settings', event => {
    commas.frame.send(event.sender, 'open-preference-pane')
  })

  const focusedWindow = $(commas.frame.useFocusedWindow())
  commas.context.handle('global-main:open-settings', () => {
    if (focusedWindow) {
      commas.frame.send(focusedWindow.webContents, 'open-preference-pane')
    }
  })

  if (defaultHandler) {
    commas.app.onCleanup(() => {
      ipcMain.handle('open-settings', defaultHandler)
      commas.context.handle('global-main:open-settings', defaultHandler)
    })
  }

  commas.i18n.addTranslationDirectory('locales')

}
