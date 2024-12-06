import * as commas from 'commas:api/renderer'

export const useAIServerStatus = commas.helper.reuse(() => {
  return commas.ipcRenderer.inject('ai-server-status', false)
})
