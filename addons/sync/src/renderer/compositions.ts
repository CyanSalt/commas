import * as commas from 'commas:api/renderer'
import type { SyncData } from '../../typings/data'

const syncDataRef = commas.ipcRenderer.inject<SyncData>('sync-data', {
  token: null,
  gistURL: null,
  uploadedAt: null,
  downloadedAt: null,
})

const syncData = commas.helper.surface(syncDataRef, true)

export function useSyncData() {
  return syncData
}
