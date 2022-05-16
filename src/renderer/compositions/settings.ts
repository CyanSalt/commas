import { memoize } from 'lodash'
import type { AddonInfo } from '../../../typings/addon'
import type { Settings, SettingsSpec } from '../../../typings/settings'
import { surface } from '../../shared/compositions'
import { injectIPC } from '../utils/compositions'

export const useSettings = memoize(() => {
  const settingsRef = injectIPC<Settings>('settings', {})
  return surface(settingsRef, true)
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
