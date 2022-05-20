import { ipcRenderer } from 'electron'
import { getAddonManifest, useLanguage } from '../../src/renderer/compositions/i18n'
import {
  useAddons,
  useSettings,
  useSettingsSpecs,
  useUserSettings,
} from '../../src/renderer/compositions/settings'

export * from '../shim'

function openDefaultSettings() {
  return ipcRenderer.invoke('open-default-settings')
}

function openSettingsFile() {
  return ipcRenderer.invoke('open-settings-file')
}

function openUserDirectory() {
  return ipcRenderer.invoke('open-user-directory')
}

function openUserFile(file: string, example?: string) {
  return ipcRenderer.invoke('open-user-file', file, example)
}

export {
  useAddons,
  useLanguage,
  useSettings,
  useSettingsSpecs,
  useUserSettings,
  getAddonManifest,
  openDefaultSettings,
  openSettingsFile,
  openUserDirectory,
  openUserFile,
}
