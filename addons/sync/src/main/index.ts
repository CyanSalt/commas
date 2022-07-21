import * as path from 'path'
import { effect, stop } from '@vue/reactivity'
import * as commas from 'commas:api/main'
import { getSyncDataRef, useSyncData } from './compositions'

declare module '../../../../src/typings/settings' {
  export interface Settings {
    'sync.plan.gist': string,
    'sync.plan.mode': 'read-write' | 'read-only' | 'disabled',
    'sync.plan.ignoredFiles': string[],
  }
}

declare module '../../../../api/modules/context' {
  export interface Context {
    'sync.file': string,
  }
}

export default () => {

  commas.i18n.addTranslationDirectory('locales')

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.context.provide('sync.file', 'custom.css')
  commas.context.provide('sync.file', 'custom.js')
  commas.context.provide('sync.file', 'keybindings.yaml')
  commas.context.provide('sync.file', 'settings.yaml')
  commas.context.provide('sync.file', 'translation.yaml')

  const settings = commas.settings.useSettings()

  const syncData = useSyncData()

  const dynamicFilesEffect = effect(() => {
    commas.context.provide('sync.file', `themes/${settings['terminal.theme.name']}.json`)
    // TODO: shall we sync addons?
  })
  commas.app.onCleanup(() => {
    stop(dynamicFilesEffect)
  })

  const files = commas.context.getCollection('sync.file')

  commas.ipcMain.provide('sync-data', getSyncDataRef())

  commas.ipcMain.handle('upload-sync-files', async () => {
    const token = syncData.token
    const gist = settings['sync.plan.gist']
    if (!token || !gist) return
    const entries: Record<string, { content: string }> = {}
    await Promise.all(files.map(async file => {
      const content = await commas.file.readFile(commas.file.userFile(file))
      if (content) {
        entries[file.replace(path.sep, '__')] = { content }
      }
    }))
    const result = await commas.shell.requestJSON({
      url: `https://api.github.com/gists/${gist}`,
      method: 'PATCH',
    }, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `token ${token}`,
      },
      body: JSON.stringify({
        description: 'Commas Sync',
        files: entries,
      }),
    })
    syncData.gistURL = result.html_url
    syncData.updatedAt = result.updated_at
    syncData.uploadedAt = new Date().toISOString()
  })

  commas.ipcMain.handle('download-sync-files', async () => {
    const token = syncData.token
    const gist = settings['sync.plan.gist']
    if (!token || !gist) return
    const result = await commas.shell.requestJSON({
      url: `https://api.github.com/gists/${gist}`,
      method: 'GET',
    }, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `token ${token}`,
      },
    })
    syncData.gistURL = result.html_url
    syncData.updatedAt = result.updated_at
    syncData.downloadedAt = new Date().toISOString()
    const entries: Record<string, { content: string }> = result.files
    await Promise.all(Object.entries(entries).map(([file, data]) => {
      return commas.file.writeFile(
        commas.file.userFile(file.replace('__', path.sep)),
        data.content,
      )
    }))
  })

}
