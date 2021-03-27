import { memoize } from 'lodash-es'
import { injectIPC } from '../../utils/hooks'

export interface ProxyRule {
  _enabled: boolean,
  title: string,
  context: string[],
  proxy: {
    target: string,
    records?: string[],
  },
}

export const useProxyServerStatus = memoize(() => {
  return injectIPC<boolean>('proxy-server-status', false)
})

export const useSystemProxyStatus = memoize(() => {
  return injectIPC<boolean>('system-proxy-status', false)
})

export const useProxyRules = memoize(() => {
  return injectIPC<ProxyRule[]>('proxy-rules', [])
})
