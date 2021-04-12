import { memoize } from 'lodash-es'
import { injectIPC } from '../../utils/hooks'

export const useProxyServerStatus = memoize(() => {
  return injectIPC<boolean | undefined>('proxy-server-status', undefined)
})

export const useSystemProxyStatus = memoize(() => {
  return injectIPC<boolean>('system-proxy-status', false)
})

export const useProxyRootCAStatus = memoize(() => {
  return injectIPC<boolean>('proxy-root-ca-status', false)
})
