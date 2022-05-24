import { surface } from '../../shared/compositions'
import type { AddonInfo } from '../../typings/addon'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { injectIPC } from '../utils/compositions'
import { diligent } from '../utils/helper'

export const useSettings = diligent(() => {
  const settingsRef = injectIPC<Settings>('settings', {})
  return surface(settingsRef, true)
})

export const useUserSettings = diligent(() => {
  return injectIPC<Settings>('user-settings', {})
})

export const useSettingsSpecs = diligent(() => {
  return injectIPC<SettingsSpec[]>('settings-specs', [])
})

export const useAddons = diligent(() => {
  return injectIPC<AddonInfo[]>('addons', [])
})
