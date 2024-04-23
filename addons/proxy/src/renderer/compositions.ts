import * as commas from 'commas:api/renderer'

export const useProxyServerInstalled = commas.helper.reuse(() => {
  return commas.ipcRenderer.inject<boolean>('proxy-server-installed', true)
})

export const useProxyServerStatus = commas.helper.reuse(() => {
  return commas.ipcRenderer.inject<boolean | undefined>('proxy-server-status', undefined)
})

export const useSystemProxyStatus = commas.helper.reuse(() => {
  return commas.ipcRenderer.inject<boolean>('system-proxy-status', false)
})

export const useProxyServerVersion = commas.helper.reuse(() => {
  return commas.ipcRenderer.inject<string | undefined>('proxy-server-version', undefined)
})

export const useProxyRootCAStatus = commas.helper.reuse(() => {
  return commas.ipcRenderer.inject<boolean>('proxy-root-ca-status', false)
})
