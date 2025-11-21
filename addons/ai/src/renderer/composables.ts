import * as commas from 'commas:api/renderer'

export const useAIStatus = commas.helper.reuse(() => {
  return commas.ipcRenderer.inject('ai-status', false)
})
