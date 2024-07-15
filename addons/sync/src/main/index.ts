import * as commas from 'commas:api/main'
import { BrowserWindow, dialog } from 'electron'
import type { SyncPlan } from '../types/sync'
import { encryptToken, getSyncDataRef, useSyncData } from './compositions'
import { downloadFiles, uploadFiles } from './gist'
import { createSyncPlan, useDefaultSyncPlan } from './plan'

declare module '@commas/types/settings' {
  export interface Settings {
    'sync.plan.gist': string,
    'sync.plan.ignores': string[],
    'sync.plan.extraPlans': SyncPlan[],
  }
}

declare module '@commas/api/modules/context' {
  export interface Context {
    'sync.file': string,
  }
}

declare module '@commas/electron-ipc' {
  export interface Commands {
    'set-sync-token': (token: string | null) => void,
    'upload-sync-files': () => void,
    'download-sync-files': () => void,
    'add-sync-plan': () => void,
    'upload-sync-plan': (plan: SyncPlan) => Partial<SyncPlan> | undefined,
    'download-sync-plan': (plan: SyncPlan) => Partial<SyncPlan> | undefined,
  }
  export interface Refs {
    'sync-data': ReturnType<typeof getSyncDataRef>,
  }
}

export default () => {

  commas.context.provide('sync.file', 'custom.css')
  commas.context.provide('sync.file', 'custom.js')
  commas.context.provide('sync.file', 'keybindings.yaml')
  commas.context.provide('sync.file', 'settings.yaml')
  commas.context.provide('sync.file', 'translation.yaml')

  const settings = commas.settings.useSettings()

  const syncData = useSyncData()

  commas.app.effect(() => {
    commas.context.provide('sync.file', `themes/${settings['terminal.theme.name']}.json`)
    commas.context.provide('sync.file', `themes/${settings['terminal.theme.lightName']}.json`)
    // TODO: shall we sync addons?
  })

  const defaultPlan = $(useDefaultSyncPlan())

  commas.ipcMain.provide('sync-data', getSyncDataRef())

  commas.ipcMain.handle('set-sync-token', async (event, token) => {
    syncData.encryption = encryptToken(token)
  })

  commas.ipcMain.handle('upload-sync-files', async () => {
    const result = await uploadFiles(defaultPlan)
    if (!settings['sync.plan.gist']) {
      settings['sync.plan.gist'] = `${result.owner.login}/${result.id}`
    }
    syncData.updatedAt = result.updated_at
  })

  commas.ipcMain.handle('download-sync-files', async () => {
    const result = await downloadFiles(defaultPlan)
    if (!settings['sync.plan.gist'].includes('/')) {
      settings['sync.plan.gist'] = `${result.owner.login}/${result.id}`
    }
    syncData.updatedAt = new Date().toISOString()
  })

  commas.ipcMain.handle('add-sync-plan', async (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    const result = await dialog.showOpenDialog(frame, {
      properties: process.platform === 'darwin'
        ? ['openFile', 'openDirectory', 'multiSelections', 'showHiddenFiles', 'createDirectory']
        : ['openFile', 'multiSelections', 'showHiddenFiles', 'dontAddToRecent'],
    })
    if (result.canceled) return
    const plan = await createSyncPlan(result.filePaths)
    settings['sync.plan.extraPlans'] = settings['sync.plan.extraPlans'].concat(plan)
  })

  commas.ipcMain.handle('upload-sync-plan', async (event, plan) => {
    const result = await uploadFiles(plan)
    if (!plan.gist.includes('/')) {
      return {
        gist: `${result.owner.login}/${result.id}`,
      }
    }
  })

  commas.ipcMain.handle('download-sync-plan', async (event, plan) => {
    const result = await downloadFiles(plan)
    if (!plan.gist.includes('/')) {
      return {
        gist: `${result.owner.login}/${result.id}`,
      }
    }
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
