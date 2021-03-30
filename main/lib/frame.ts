import { customRef } from '@vue/reactivity'
import { app, BrowserWindow } from 'electron'

function hasWindow() {
  return Boolean(BrowserWindow.getAllWindows().length)
}

function getLastWindow() {
  const frames = BrowserWindow.getAllWindows()
  return frames[frames.length - 1]
}

function broadcast(event: string, ...args: any[]) {
  BrowserWindow.getAllWindows().forEach(frame => {
    frame.webContents.send(event, ...args)
  })
}

const focusedWindowRef = customRef<BrowserWindow | null>((track, trigger) => {
  let focusedWindow: BrowserWindow | null = null
  app.on('browser-window-focus', (event, frame) => {
    if (focusedWindow !== frame) {
      focusedWindow = frame
      trigger()
    }
  })
  app.on('browser-window-blur', (event, frame) => {
    if (focusedWindow === frame) {
      focusedWindow = null
      trigger()
    }
  })
  // Electron will not trigger 'browser-window-blur' when the window is closed
  app.on('browser-window-created', (event, frame) => {
    frame.on('closed', () => {
      if (focusedWindow === frame) {
        focusedWindow = null
        trigger()
      }
    })
  })
  return {
    get() {
      track()
      return focusedWindow
    },
    set(frame) {
      if (frame) {
        frame.focus()
      } else if (focusedWindow) {
        focusedWindow.blur()
      }
    },
  }
})

export function useFocusedWindow() {
  return focusedWindowRef
}

export {
  hasWindow,
  getLastWindow,
  broadcast,
}
