import { memoize } from 'lodash-es'
import { injectIPC } from '../utils/hooks'
import type { Settings, SettingsSpec } from '../../typings/settings'

export const useSettings = memoize(() => {
  return injectIPC<Settings>('settings', {})
})

export const useUserSettings = memoize(() => {
  return injectIPC<Settings>('user-settings', {})
})

export const useSettingsSpecs = memoize(() => {
  return injectIPC<SettingsSpec[]>('settings-specs', [])
})

export const useAddons = memoize(() => {
  return injectIPC<string[]>('addons', [])
})
