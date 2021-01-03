import { memoize } from 'lodash-es'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { useRemoteData } from './remote'

export const useSettings = memoize(() => {
  return useRemoteData<Settings>({}, {
    getter: 'get-settings',
    setter: 'set-settings',
    effect: 'settings-updated',
  })
})

export const useUserSettings = memoize(() => {
  return useRemoteData<Settings>({}, {
    getter: 'get-user-settings',
    setter: 'set-settings',
    effect: 'user-settings-updated',
  })
})

export const useSettingsSpecs = memoize(() => {
  return useRemoteData<SettingsSpec[]>([], {
    getter: 'get-settings-specs',
    effect: 'settings-specs-updated',
  })
})
