import * as commas from 'commas:api/renderer'
import type { SyncData } from '../../typings/sync'

export const useSyncData = commas.helper.reuse(() => {
  return commas.helper.surface(
    commas.ipcRenderer.inject<SyncData>('sync-data', {
      token: null,
      updatedAt: null,
    }),
    true,
  )
})
