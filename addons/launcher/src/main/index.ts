import * as commas from 'commas:api/main'
import { BrowserWindow, dialog } from 'electron'
import type { Launcher } from '../../typings/launcher'
import { createLauncher } from './create'
import { useLaunchers } from './launcher'

declare module '../../../../src/typings/settings' {
  export interface Settings {
    'launcher.session.persist'?: boolean,
  }
}

export default () => {

  commas.context.provide('sync.file', 'launchers.yaml')

  let launchers = $(useLaunchers())
  commas.ipcMain.provide('launchers', $$(launchers))

  commas.ipcMain.handle('create-launcher', async (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    const result = await dialog.showOpenDialog(frame, {
      properties: process.platform === 'darwin'
        ? ['openFile', 'openDirectory', 'multiSelections', 'createDirectory']
        : ['openFile', 'multiSelections', 'dontAddToRecent'],
    })
    if (result.canceled) return
    const created = await Promise.all(result.filePaths.map(entry => createLauncher(entry))) as Launcher[]
    launchers = [...launchers, ...created]
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
