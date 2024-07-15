import * as commas from 'commas:api/main'
import type { Session } from 'electron'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'get-cache-size': Session['getCacheSize'],
    'clear-cache': Session['clearCache'],
  }
}

export default () => {

  commas.ipcMain.handle('get-cache-size', event => {
    return event.sender.session.getCacheSize()
  })

  commas.ipcMain.handle('clear-cache', event => {
    event.sender.session.clearCache()
  })

  commas.i18n.addTranslationDirectory('locales')

}
