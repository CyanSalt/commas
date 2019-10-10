import Vue from 'vue'
import {remote, ipcRenderer} from 'electron'

const currentWindow = remote.getCurrentWindow()
const currentState = Vue.observable({
  maximized: currentWindow.isMaximized(),
  fullscreen: currentWindow.isFullScreen(),
})

ipcRenderer.on('maximize', () => {
  currentState.maximized = true
})
ipcRenderer.on('unmaximize', () => {
  currentState.maximized = false
})
ipcRenderer.on('enter-full-screen', () => {
  currentState.fullscreen = true
})
ipcRenderer.on('leave-full-screen', () => {
  currentState.fullscreen = false
})

export {
  currentWindow,
  currentState,
}
