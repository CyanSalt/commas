import * as path from 'path'
import * as commas from 'commas:api/main'
import { discoverAddons, useDiscoveredAddons } from './discover'

commas.i18n.addTranslationDirectory(path.join(__dirname, '../../locales'))

const discoveredAddonsRef = useDiscoveredAddons()
commas.ipcMain.provide('discovered-addons', discoveredAddonsRef)

commas.ipcMain.handle('discover-addons', () => {
  discoverAddons()
})

commas.ipcMain.handle('set-addons', (event, value: string[]) => {
  commas.settings.updateSettings({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'terminal.addon.includes': value,
  })
})
