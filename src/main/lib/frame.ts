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

const focusedWindow = $customRef<BrowserWindow | null>((track, trigger) => {
  let value: BrowserWindow | null = null
  app.on('browser-window-focus', (event, frame) => {
    if (value !== frame) {
      value = frame
      trigger()
    }
  })
  app.on('browser-window-blur', (event, frame) => {
    if (value === frame) {
      value = null
      trigger()
    }
  })
  // Electron will not trigger 'browser-window-blur' when the window is closed
  app.on('browser-window-created', (event, frame) => {
    frame.on('closed', () => {
      if (value === frame) {
        value = null
        trigger()
      }
    })
  })
  return {
    get() {
      track()
      return value
    },
    set(frame) {
      if (frame) {
        frame.focus()
      } else if (value) {
        value.blur()
      }
    },
  }
})

function useFocusedWindow() {
  return $$(focusedWindow)
}

export {
  hasWindow,
  getLastWindow,
  broadcast,
  useFocusedWindow,
}
