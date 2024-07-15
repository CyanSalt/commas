import type { WebContents } from 'electron'
import { app, BrowserWindow } from 'electron'
import type { RendererEventDefinitions } from '@commas/electron-ipc'

function hasWindow() {
  return Boolean(BrowserWindow.getAllWindows().length)
}

function getLastWindow() {
  const frames = BrowserWindow.getAllWindows()
  return frames[frames.length - 1]
}

function send<
  K extends keyof RendererEventDefinitions,
>(
  sender: WebContents,
  event: K,
  ...args: Parameters<RendererEventDefinitions[K]>
) {
  sender.send(event, ...args)
}

function broadcast<
  K extends keyof RendererEventDefinitions,
>(event: K, ...args: Parameters<RendererEventDefinitions[K]>) {
  BrowserWindow.getAllWindows().forEach(frame => {
    send(frame.webContents, event, ...args)
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
  send,
  broadcast,
  useFocusedWindow,
}
