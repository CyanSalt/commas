import { memoize } from 'lodash-es'
import { useRemoteData } from '../../hooks/remote'

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
  return useRemoteData(false, {
    getter: 'get-proxy-server-status',
    setter: 'set-proxy-server-status',
    effect: 'proxy-server-status-updated',
  })
})

export const useSystemProxyStatus = memoize(() => {
  return useRemoteData(false, {
    getter: 'get-system-proxy-status',
    setter: 'set-system-proxy-status',
    effect: 'system-proxy-status-updated',
  })
})

export const useProxyRules = memoize(() => {
  return useRemoteData<ProxyRule[]>([], {
    getter: 'get-proxy-rules',
    setter: 'set-proxy-rules',
    effect: 'proxy-rules-updated',
  })
})
