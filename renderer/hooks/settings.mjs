import { memoize } from 'lodash-es'
import { useRemoteData } from './remote'

export const useSettings = memoize(() => {
  return useRemoteData({}, {
    getter: 'get-settings',
    setter: 'set-settings',
    effect: 'settings-updated',
  })
})

export const useUserSettings = memoize(() => {
  return useRemoteData({}, {
    getter: 'get-user-settings',
    setter: 'set-settings',
    effect: 'user-settings-updated',
  })
})

export const useSettingsSpecs = memoize(() => {
  return useRemoteData([], {
    getter: 'get-settings-specs',
    effect: 'settings-specs-updated',
  })
})
