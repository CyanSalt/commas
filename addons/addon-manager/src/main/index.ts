import * as commas from 'commas:api/main'
import { discoverAddons, useDiscoveredAddons } from './discover'

export default () => {

  commas.i18n.addTranslationDirectory('locales')

  const discoveredAddons = $(useDiscoveredAddons())
  commas.ipcMain.provide('discovered-addons', $$(discoveredAddons))

  commas.ipcMain.handle('discover-addons', () => {
    discoverAddons()
  })

  commas.ipcMain.handle('set-addons', (event, value: string[]) => {
    Object.assign(commas.settings.useSettings(), {
      'terminal.addon.includes': value,
    })
  })

}
