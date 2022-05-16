import { memoize } from 'lodash'
import { surface } from '../../shared/compositions'
import type { AddonInfo } from '../../typings/addon'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { injectIPC } from '../utils/compositions'

export const useSettings = memoize(() => {
  const settingsRef = injectIPC<Settings>('settings', {})
  return surface(settingsRef)
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
