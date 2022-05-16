import * as path from 'path'
import * as commas from 'commas:api/main'

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))

commas.ipcMain.handle('reset-theme', () => {
  const settings = commas.settings.useSettings()
  const defaultSettings = commas.settings.useDefaultSettings()
  settings['terminal.theme.name'] = defaultSettings['terminal.theme.name']
})
