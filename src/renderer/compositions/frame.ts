import { ipcRenderer } from 'electron'
import { reuse } from '../../shared/helper'
import { injectIPC } from '../utils/compositions'

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
  ipcRenderer.on('open-window', () => {
    ipcRenderer.invoke('open-window')
  })
  ipcRenderer.on('close-window', () => {
    window.close()
  })
}
