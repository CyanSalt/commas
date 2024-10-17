import { ipcRenderer } from '@commas/electron-ipc'
import { globalHandler } from '../../shared/handler'
import { translate } from '../utils/i18n'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'uncaught-error': (error: string) => void,
    'toggle-finding': () => void,
    'toggle-tab-list': () => void,
    'before-quit': () => void,
  }
  export interface GlobalCommands {
    'global-renderer:open-file': (file: string) => void,
    'global-renderer:open-directory': (directory: string) => void,
    'global-renderer:show-directory': (directory: string) => void,
    'global-renderer:open-url': (url: string) => void,
  }
}

let isTabListEnabled = $ref(true)
export function useIsTabListEnabled() {
  return $$(isTabListEnabled)
}

let isTabListToggling = $ref(false)
export function useIsTabListToggling() {
  return $$(isTabListToggling)
}

let isFinding = $ref(false)
export function useIsFinding() {
  return $$(isFinding)
}

let willQuit = $ref(false)
export function useWillQuit() {
  return $$(willQuit)
}

export async function toggleTabList() {
  isTabListToggling = true
  const transition = document.startViewTransition(() => {
    isTabListEnabled = !isTabListEnabled
  })
  await transition.updateCallbackDone
  isTabListToggling = false
}

export async function confirmClosing() {
  const args = {
    type: 'question' as const,
    message: translate('Close Window?#!terminal.1'),
    detail: translate('All tabs in this window will be closed.#!terminal.2'),
    buttons: [
      translate('Confirm#!terminal.3'),
      translate('Cancel#!terminal.4'),
    ],
    defaultId: 0,
    cancelId: 1,
  }
  const { response } = await ipcRenderer.invoke('message-box', args)
  return response === 0
}

export function openFile(file: string) {
  return globalHandler.invoke('global-renderer:open-file', file)
}

export function showFileExternally(file: string) {
  return ipcRenderer.invoke('show-file', file)
}

export function openDirectory(directory: string) {
  return globalHandler.invoke('global-renderer:open-directory', directory)
}

export function openDirectoryExternally(directory: string) {
  return ipcRenderer.invoke('open-path', directory)
}

export function showDirectory(file: string) {
  return globalHandler.invoke('global-renderer:show-directory', file)
}

export function openURL(url: string) {
  return globalHandler.invoke('global-renderer:open-url', url)
}

export function openURLExternally(url: string) {
  return ipcRenderer.invoke('open-url', url)
}

export function handleShellMessages() {
  ipcRenderer.on('uncaught-error', (event, error) => {
    console.error(`Uncaught error in main process: ${error}`)
  })
  ipcRenderer.on('toggle-finding', () => {
    isFinding = !isFinding
  })
  ipcRenderer.on('toggle-tab-list', () => {
    toggleTabList()
  })
  ipcRenderer.on('before-quit', () => {
    willQuit = true
  })
  globalHandler.handle('global-renderer:open-file', (file) => {
    return showFileExternally(file)
  })
  globalHandler.handle('global-renderer:open-directory', (directory) => {
    return openDirectoryExternally(directory)
  })
  globalHandler.handle('global-renderer:show-directory', (directory) => {
    return openDirectoryExternally(directory)
  })
  globalHandler.handle('global-renderer:open-url', (url) => {
    return openURLExternally(url)
  })
}
