import { surface } from '../../shared/compositions'
import { diligent } from '../../shared/helper'
import type { AddonInfo } from '../../typings/addon'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { injectIPC } from '../utils/compositions'

export const useSettings = diligent(() => {
  const settingsRef = injectIPC<Settings>('settings', {})
  return surface(settingsRef, true)
})

export const useSettingsSpecs = diligent(() => {
  return injectIPC<SettingsSpec[]>('settings-specs', [])
})

export const useAddons = diligent(() => {
  return injectIPC<AddonInfo[]>('addons', [])
})
