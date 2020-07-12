import { memoize } from 'lodash-es'
import { useRemoteData } from '../../hooks/remote'

export const useProxyServerStatus = memoize(() => {
  return useRemoteData(false, {
    getter: 'get-proxy-server-status',
    setter: 'set-proxy-server-status',
    effect: 'proxy-server-status-updated',
  })
})
