import * as commas from 'commas:api/main'

export default () => {

  commas.ipcMain.handle('get-cache-size', event => {
    return event.sender.session.getCacheSize()
  })

  commas.ipcMain.handle('clear-cache', event => {
    event.sender.session.clearCache()
  })

  commas.i18n.addTranslationDirectory('locales')

}
