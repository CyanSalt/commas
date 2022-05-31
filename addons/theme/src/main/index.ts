import * as commas from 'commas:api/main'

export default () => {

  commas.i18n.addTranslationDirectory('locales')

  commas.ipcMain.handle('reset-theme', () => {
    const settings = commas.settings.useSettings()
    const defaultSettings = commas.settings.useDefaultSettings()
    settings['terminal.theme.name'] = defaultSettings['terminal.theme.name']
  })

}
