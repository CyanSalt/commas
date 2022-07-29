import * as commas from 'commas:api/renderer'
import type { SyncData } from '../../typings/sync'

const syncDataRef = commas.ipcRenderer.inject<SyncData>('sync-data', {
  token: null,
  updatedAt: null,
})

const syncData = commas.helper.surface(syncDataRef, true)

export function useSyncData() {
  return syncData
}
