import { ipcRenderer } from '@commas/electron-ipc'
import { useFile } from '../../renderer/compositions/frame'
import { getI18nManifest, useLanguage } from '../../renderer/compositions/i18n'
import {
  useAddons,
  useSettings,
  useSettingsSpecs,
} from '../../renderer/compositions/settings'
import { openDirectory, openDirectoryExternally, openFile, openURL, openURLExternally, showDirectory, showFileExternally } from '../../renderer/compositions/shell'
import { useIsLightTheme, useTheme } from '../../renderer/compositions/theme'
import { translate } from '../../renderer/utils/i18n'

export * from '../shim'

async function openUserDirectory() {
  const directory = await ipcRenderer.invoke('prepare-user-directory')
  openDirectory(directory)
}

async function openDefaultSettings() {
  const filePath = await ipcRenderer.invoke('prepare-default-settings')
  openFile(filePath)
}

async function openSettingsFile() {
  const filePath = await ipcRenderer.invoke('prepare-settings-file')
  openFile(filePath)
}

async function openUserFile(file: string, example?: string) {
  const filePath = await ipcRenderer.invoke('prepare-user-file', file, example)
  openFile(filePath)
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
  openFile,
  showFileExternally,
  openDirectory,
  openDirectoryExternally,
  showDirectory,
  openURL,
  openURLExternally,
}
