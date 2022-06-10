import * as commas from 'commas:api/main'

export default () => {

  commas.i18n.addTranslationDirectory('locales')

  commas.ipcMain.handle('reset-theme', () => {
    const settings = commas.settings.useSettings()
    // @ts-expect-error reset settings
    delete settings['terminal.theme.name']
    // @ts-expect-error reset settings
    delete settings['terminal.theme.customization']
  })

}
