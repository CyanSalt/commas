import * as commas from 'commas:api/main'
import { BrowserWindow } from 'electron'
import type { Launcher, LauncherInfo } from '../types/launcher'
import { createLauncher } from './create'
import { useLaunchers } from './launcher'

declare module '@commas/types/settings' {
  export interface Settings {
    'launcher.session.persist'?: boolean,
  }
}

export default () => {

  commas.context.provide('sync.file', 'launchers.yaml')

  let launchers = $(useLaunchers())
  commas.ipcMain.provide('launchers', $$(launchers))

  commas.ipcMain.handle('create-launcher', async (event, data: LauncherInfo, index: number) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    const created = await createLauncher(data) as Launcher
    const updated = [...launchers]
    updated.splice(index, 0, created)
    launchers = updated
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
