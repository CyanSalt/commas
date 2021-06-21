import { memoize } from 'lodash-es'
import type { AddonInfo } from '../../typings/addon'
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

export const useDiscoveredAddons = memoize(() => {
  return injectIPC<Record<string, AddonInfo>>('discovered-addons', {})
})

export const useAddons = memoize(() => {
  return injectIPC<string[]>('addons', [])
})
