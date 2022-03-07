import * as commas from 'commas:api/renderer'
import { memoize } from 'lodash-es'

export const useProxyServerStatus = memoize(() => {
  return commas.ipcRenderer.inject<boolean | undefined>('proxy-server-status', undefined)
})

export const useSystemProxyStatus = memoize(() => {
  return commas.ipcRenderer.inject<boolean>('system-proxy-status', false)
})

export const useProxyServerVersion = memoize(() => {
  return commas.ipcRenderer.inject<string | null | undefined>('proxy-server-version', undefined)
})

export const useProxyRootCAStatus = memoize(() => {
  return commas.ipcRenderer.inject<boolean>('proxy-root-ca-status', false)
})
