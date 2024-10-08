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
  }
}

let isTabListEnabled = $ref(true)
export function useIsTabListEnabled() {
  return $$(isTabListEnabled)
}

let isFinding = $ref(false)
export function useIsFinding() {
  return $$(isFinding)
}

let willQuit = $ref(false)
export function useWillQuit() {
  return $$(willQuit)
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

export function handleShellMessages() {
  ipcRenderer.on('uncaught-error', (event, error) => {
    console.error(`Uncaught error in main process: ${error}`)
  })
  ipcRenderer.on('toggle-finding', () => {
    isFinding = !isFinding
  })
  ipcRenderer.on('toggle-tab-list', () => {
    isTabListEnabled = !isTabListEnabled
  })
  ipcRenderer.on('before-quit', () => {
    willQuit = true
  })
  globalHandler.handle('global-renderer:open-file', (file) => {
    ipcRenderer.invoke('show-file', file)
  })
}
