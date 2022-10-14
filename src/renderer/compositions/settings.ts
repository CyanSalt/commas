import { surface } from '../../shared/compositions'
import { reuse } from '../../shared/helper'
import type { AddonInfo } from '../../typings/addon'
import type { Settings, SettingsSpec } from '../../typings/settings'
import { injectIPC } from '../utils/compositions'

export const useSettings = reuse(() => {
  return surface(
    injectIPC('settings', {} as Settings),
    true,
  )
})

export const useSettingsSpecs = reuse(() => {
  return injectIPC<SettingsSpec[]>('settings-specs', [])
})

export const useAddons = reuse(() => {
  return injectIPC<AddonInfo[]>('addons', [])
})
