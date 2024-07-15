import * as commas from 'commas:api/main'
import { discoverAddons, useDiscoveredAddons } from './discover'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'discover-addons': typeof discoverAddons,
    'set-addons': (value: string[]) => void,
  }
  export interface Refs {
    'discovered-addons': ReturnType<typeof useDiscoveredAddons>,
  }
}

export default () => {

  const discoveredAddons = $(useDiscoveredAddons())
  commas.ipcMain.provide('discovered-addons', $$(discoveredAddons))

  commas.ipcMain.handle('discover-addons', () => {
    discoverAddons()
  })

  commas.ipcMain.handle('set-addons', (event, value) => {
    Object.assign(commas.settings.useSettings(), {
      'terminal.addon.includes': value,
    })
  })

  commas.i18n.addTranslationDirectory('locales')

}
