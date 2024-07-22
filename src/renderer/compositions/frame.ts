import { ipcRenderer } from '@commas/electron-ipc'
import { reuse } from '../../shared/helper'
import { injectIPC } from '../utils/compositions'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'close-window': () => void,
  }
}

export function useFile(file: string) {
  return injectIPC('file', '', file)
}

export const useMinimized = reuse(() => {
  return injectIPC('minimized', false)
})

export const useMaximized = reuse(() => {
  return injectIPC('maximized', false)
})

export const useFullscreen = reuse(() => {
  return injectIPC('fullscreen', false)
})

export function handleFrameMessages() {
  ipcRenderer.on('close-window', () => {
    window.close()
  })
}
