import { ipcRenderer } from 'electron'
import { useFile } from '../../src/renderer/compositions/frame'
import { getAddonManifest, useLanguage } from '../../src/renderer/compositions/i18n'
import {
  useAddons,
  useSettings,
  useSettingsSpecs,
} from '../../src/renderer/compositions/settings'
import { openCodeEditorTab } from '../../src/renderer/compositions/terminal'
import { translate } from '../../src/renderer/utils/i18n'

export * from '../shim'

function openUserDirectory() {
  return ipcRenderer.invoke('open-user-directory')
}

async function openDefaultSettings() {
  const filePath: string = await ipcRenderer.invoke('prepare-default-settings')
  openCodeEditorTab(filePath)
}

async function openSettingsFile() {
  const filePath: string = await ipcRenderer.invoke('prepare-settings-file')
  openCodeEditorTab(filePath)
}

async function openUserFile(file: string, example?: string) {
  const filePath: string = await ipcRenderer.invoke('prepare-user-file', file, example)
  openCodeEditorTab(filePath)
}

function downloadUserFile(file: string, url: string, force?: boolean) {
  return ipcRenderer.invoke('download-user-file', file, url, force)
}

export {
  useAddons,
  useLanguage,
  useSettings,
  useSettingsSpecs,
  useFile,
  getAddonManifest,
  openUserDirectory,
  openDefaultSettings,
  openSettingsFile,
  openUserFile,
  downloadUserFile,
  translate,
}
