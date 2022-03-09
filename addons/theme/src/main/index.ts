import * as path from 'path'
import { unref } from '@vue/reactivity'
import * as commas from 'commas:api/main'

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))

commas.ipcMain.handle('reset-theme', () => {
  const defaultSettings = unref(commas.settings.useDefaultSettings())
  const defaultThemeName = defaultSettings['terminal.theme.name']
  commas.settings.updateSettings({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'terminal.theme.name': defaultThemeName,
  })
})
