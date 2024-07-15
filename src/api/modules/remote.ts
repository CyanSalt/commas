import { ipcRenderer } from 'electron'
import { useFile } from '../../renderer/compositions/frame'
import { getI18nManifest, useLanguage } from '../../renderer/compositions/i18n'
import {
  useAddons,
  useSettings,
  useSettingsSpecs,
} from '../../renderer/compositions/settings'
import { useIsLightTheme, useTheme } from '../../renderer/compositions/theme'
import { translate } from '../../renderer/utils/i18n'
import { globalHandler } from '../../shared/handler'

export * from '../shim'

function openUserDirectory() {
  return ipcRenderer.invoke('open-user-directory')
}

async function openDefaultSettings() {
  const filePath: string = await ipcRenderer.invoke('prepare-default-settings')
  globalHandler.invoke('global:open-file', filePath)
}

async function openSettingsFile() {
  const filePath: string = await ipcRenderer.invoke('prepare-settings-file')
  globalHandler.invoke('global:open-file', filePath)
}

async function openUserFile(file: string, example?: string) {
  const filePath: string = await ipcRenderer.invoke('prepare-user-file', file, example)
  globalHandler.invoke('global:open-file', filePath)
}

function writeUserFile(file: string, content?: string) {
  return ipcRenderer.invoke('write-user-file', file, content)
}

export {
  useAddons,
  useLanguage,
  useSettings,
  useSettingsSpecs,
  useIsLightTheme,
  useTheme,
  useFile,
  getI18nManifest,
  openUserDirectory,
  openDefaultSettings,
  openSettingsFile,
  openUserFile,
  writeUserFile,
  translate,
}
