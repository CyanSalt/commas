import { memoize } from 'lodash-es'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { injectIPC } from '../utils/hooks'

export const useSettings = memoize(() => {
  return injectIPC<Settings>('settings', {})
})

export const useUserSettings = memoize(() => {
  return injectIPC<Settings>('user-settings', {})
})

export const useSettingsSpecs = memoize(() => {
  return injectIPC<SettingsSpec[]>('settings-specs', [])
})
