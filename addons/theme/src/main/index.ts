import * as commas from 'commas:api/main'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'reset-theme': () => void,
  }
}

export default () => {

  commas.i18n.addTranslationDirectory('locales')

  commas.ipcMain.handle('reset-theme', () => {
    const settings = commas.settings.useSettings()
    const defaultSettings = commas.settings.useDefaultSettings()
    settings['terminal.theme.type'] = defaultSettings['terminal.theme.type']
    settings['terminal.theme.name'] = defaultSettings['terminal.theme.name']
    settings['terminal.theme.lightName'] = defaultSettings['terminal.theme.lightName']
    settings['terminal.theme.customization'] = defaultSettings['terminal.theme.customization']
    settings['terminal.theme.lightCustomization'] = defaultSettings['terminal.theme.lightCustomization']
  })

}
