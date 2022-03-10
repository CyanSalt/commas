import { memoize } from 'lodash-es'
import type { AddonInfo } from '../../typings/addon'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { injectIPC } from '../utils/compositions'

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
  return injectIPC<AddonInfo[]>('addons', [])
})
