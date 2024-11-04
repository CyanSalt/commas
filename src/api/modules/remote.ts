import { ipcRenderer } from '@commas/electron-ipc'
import { useFile } from '../../renderer/compositions/frame'
import { getI18nManifest, useLanguage } from '../../renderer/compositions/i18n'
import {
  useAddons,
  useSettings,
  useSettingsSpecs,
} from '../../renderer/compositions/settings'
import { addFile, openDirectory, openFile, openFileExternally, openURL, openURLExternally, showDirectory, showFileExternally } from '../../renderer/compositions/shell'
import { useIsLightTheme, useTheme } from '../../renderer/compositions/theme'
import { translate } from '../../renderer/utils/i18n'
import type { RendererAPIContext } from '../types'

export * from '../shim'

async function openUserDirectory(this: RendererAPIContext, event?: MouseEvent) {
  const directory = await ipcRenderer.invoke('prepare-user-directory')
  return this.$.ui.openFolder(directory, event)
}

async function openDefaultSettings(this: RendererAPIContext, event?: MouseEvent) {
  const filePath = await ipcRenderer.invoke('prepare-default-settings')
  return this.$.ui.openItem(filePath, event)
}

async function openSettingsFile(this: RendererAPIContext, event?: MouseEvent) {
  const filePath = await ipcRenderer.invoke('prepare-settings-file')
  return this.$.ui.openItem(filePath, event)
}

async function openUserFile(this: RendererAPIContext, file: string, example?: string, event?: MouseEvent) {
  const filePath = await ipcRenderer.invoke('prepare-user-file', file, example)
  return this.$.ui.openItem(filePath, event)
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
  openFileExternally,
  showDirectory,
  openURL,
  openURLExternally,
  addFile,
}
