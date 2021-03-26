import { ipcRenderer } from 'electron'
import { memoize } from 'lodash-es'
import { injectIPC } from '../utils/hooks'
import { useRemoteData } from './remote'

export const useAppVersion = memoize(() => {
  return injectIPC('app-version', '')
})

export const useMinimized = memoize(() => {
  return useRemoteData(false, {
    getter: 'get-minimized',
    setter: 'set-minimized',
    effect: 'minimized-changed',
  })
})

export const useMaximized = memoize(() => {
  return useRemoteData(false, {
    getter: 'get-maximized',
    setter: 'set-maximized',
    effect: 'maximized-changed',
  })
})

export const useFullscreen = memoize(() => {
  return useRemoteData(false, {
    getter: 'get-fullscreen',
    setter: 'set-fullscreen',
    effect: 'fullscreen-changed',
  })
})

export function handleFrameMessages() {
  ipcRenderer.on('open-window', () => {
    ipcRenderer.invoke('open-window')
  })
  ipcRenderer.on('close-window', () => {
    window.close()
  })
}
