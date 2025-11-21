import type { MaybeRefOrGetter } from 'vue'
import { ipcRenderer } from '@commas/electron-ipc'
import { reuse } from '../../shared/helper'
import { injectIPC } from '../utils/composables'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'close-window': () => void,
  }
}

export function useFile(file: MaybeRefOrGetter<string>) {
  return injectIPC('file', undefined, file)
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
