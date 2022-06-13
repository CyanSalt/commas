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

  const launchersRef = useLaunchers()
  commas.ipcMain.provide('launchers', launchersRef)

  commas.ipcMain.handle('create-launcher', async (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    const result = await dialog.showOpenDialog(frame, {
      properties: process.platform === 'darwin'
        ? ['openFile', 'openDirectory', 'multiSelections', 'createDirectory']
        : ['openFile', 'multiSelections', 'dontAddToRecent'],
    })
    const launchers = await Promise.all(result.filePaths.map(entry => createLauncher(entry))) as Launcher[]
    launchersRef.value = [...launchersRef.value, ...launchers]
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
