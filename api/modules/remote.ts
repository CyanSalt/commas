import { getAddonManifest, useLanguage } from '../../src/renderer/compositions/i18n'
import {
  useAddons,
  useSettings,
  useSettingsSpecs,
  useUserSettings,
} from '../../src/renderer/compositions/settings'

export * from '../shim'

export {
  useAddons,
  useLanguage,
  useSettings,
  useSettingsSpecs,
  useUserSettings,
  getAddonManifest,
}
