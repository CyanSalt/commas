import * as commas from 'commas:api/renderer'

export const useSyncData = commas.helper.reuse(() => {
  return commas.ipcRenderer.inject('sync-data', {
    encryption: null,
    updatedAt: null,
  })
})
