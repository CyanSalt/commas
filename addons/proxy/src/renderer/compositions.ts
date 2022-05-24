import * as commas from 'commas:api/renderer'

export const useProxyServerStatus = commas.helperRenderer.diligent(() => {
  return commas.ipcRenderer.inject<boolean | undefined>('proxy-server-status', undefined)
})

export const useSystemProxyStatus = commas.helperRenderer.diligent(() => {
  return commas.ipcRenderer.inject<boolean>('system-proxy-status', false)
})

export const useProxyServerVersionInfo = commas.helperRenderer.diligent(() => {
  return commas.ipcRenderer.inject<{
    type: string,
    version: string | null,
  }>('proxy-server-version-info', { type: 'builtin', version: null })
})

export const useProxyRootCAStatus = commas.helperRenderer.diligent(() => {
  return commas.ipcRenderer.inject<boolean>('proxy-root-ca-status', false)
})
