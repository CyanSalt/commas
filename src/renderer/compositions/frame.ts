import { ipcRenderer } from 'electron'
import { memoize } from 'lodash'
import { injectIPC } from '../utils/compositions'

export function useFile(file: string) {
  return injectIPC('file', '', file)
}

export const useMinimized = memoize(() => {
  return injectIPC('minimized', false)
})

export const useMaximized = memoize(() => {
  return injectIPC('maximized', false)
})

export const useFullscreen = memoize(() => {
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
