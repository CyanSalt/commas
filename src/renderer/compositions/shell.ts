import * as path from 'node:path'
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from '../../api/core-renderer'
import { globalHandler } from '../../shared/handler'
import { translate } from '../utils/i18n'
import { openClientURL } from './terminal'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'uncaught-error': (error: string) => void,
    'toggle-finding': () => void,
    'toggle-tab-list': () => void,
    'before-quit': () => void,
    'add-file': (file: string) => void,
  }
  export interface GlobalCommands {
    'global-renderer:open-file': (file: string) => void,
    'global-renderer:open-directory': (directory: string) => void,
    'global-renderer:show-directory': (directory: string) => void,
    'global-renderer:open-url': (url: string) => void,
    'global-renderer:add-file': (file: string) => void,
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

/**
 * {@link https://en.wikipedia.org/wiki/Quick_Look#Supported_file_types_by_default}
 */
const QUICK_LOOK_EXTENSIONS = [
  '.aac',
  '.psd',
  '.aiff',
  '.icns',
  '.avi',
  '.bmp',
  '.dae',
  '.c4d',
  '.gif',
  // '.html',
  '.ichat',
  '.jpg',
  '.jpeg',
  '.jp2',
  '.xls',
  '.xlsx',
  '.ppt',
  '.pptx',
  '.doc',
  '.docx',
  '.midi',
  '.mp3',
  '.mp4',
  '.mpo',
  '.pdf',
  '.pictureclipping',
  '.pict',
  '.pct',
  '.pic',
  '.png',
  '.mov',
  '.movie',
  '.qt',
  '.rtf',
  // '.svg',
  // '.txt',
  '.textclipping',
  '.tiff',
  '.wav',
]

export function openFile(file: string) {
  if (process.platform === 'darwin') {
    const ext = path.extname(file).toLowerCase()
    if (QUICK_LOOK_EXTENSIONS.includes(ext)) {
      return ipcRenderer.invoke('preview-file', file)
    }
  }
  return globalHandler.invoke('global-renderer:open-file', file)
}

export function showFileExternally(file: string) {
  return ipcRenderer.invoke('show-file', file)
}

export function openDirectory(directory: string) {
  return globalHandler.invoke('global-renderer:open-directory', directory)
}

export function openFileExternally(file: string) {
  return ipcRenderer.invoke('open-path', file)
}

export async function addFile(file: string) {
  return ipcRenderer.invoke('open-file', file)
}

export function showDirectory(file: string) {
  return globalHandler.invoke('global-renderer:show-directory', file)
}

export function openURL(uri: string) {
  try {
    const url = new URL(uri)
    if (url.protocol === 'commas:') {
      openClientURL(uri)
      return
    }
  } catch {
    // pass
  }
  return globalHandler.invoke('global-renderer:open-url', uri)
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
  const openers = commas.proxy.context.getCollection('terminal.file-opener')
  ipcRenderer.on('add-file', (event, file) => {
    const ext = path.extname(file).toLowerCase()
    const opener = openers.find(item => item.extensions.includes(ext))
    if (opener) {
      opener.handler(file)
    } else {
      globalHandler.invoke('global-renderer:add-file', file)
    }
  })
  globalHandler.handle('global-renderer:open-file', (file) => {
    return showFileExternally(file)
  })
  globalHandler.handle('global-renderer:open-directory', (directory) => {
    return openFileExternally(directory)
  })
  globalHandler.handle('global-renderer:show-directory', (directory) => {
    return openFileExternally(directory)
  })
  globalHandler.handle('global-renderer:open-url', (url) => {
    return openURLExternally(url)
  })
}
