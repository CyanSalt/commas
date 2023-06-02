import * as commas from 'commas:api/renderer'
import type { SyncData } from '../../typings/sync'

export const useSyncData = commas.helper.reuse(() => {
  return commas.ipcRenderer.inject<SyncData>('sync-data', {
    encryption: null,
    updatedAt: null,
  })
})
