import { getAddonManifest, useLanguage } from '../../renderer/compositions/i18n'
import {
  useAddons,
  useSettings,
  useSettingsSpecs,
  useUserSettings,
} from '../../renderer/compositions/settings'

export * from '../shim'

export {
  useAddons,
  useLanguage,
  useSettings,
  useSettingsSpecs,
  useUserSettings,
  getAddonManifest,
}
