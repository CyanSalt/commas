import Vue from 'vue'
import { remote, ipcRenderer } from 'electron'

const currentWindow = remote.getCurrentWindow()
const currentState = Vue.observable({
  maximized: currentWindow.isMaximized(),
  fullscreen: currentWindow.isFullScreen(),
})

ipcRenderer.on('maximized-changed', (event, flag) => {
  currentState.maximized = flag
})
ipcRenderer.on('fullscreen-changed', (event, flag) => {
  currentState.fullscreen = flag
})

export {
  currentState,
}
