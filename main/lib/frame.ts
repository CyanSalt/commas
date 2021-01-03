import { BrowserWindow } from 'electron'

const frames: BrowserWindow[] = []

function hasWindow() {
  return Boolean(frames.length)
}

function getLastWindow() {
  return frames[frames.length - 1]
}

function forEachWindow(callback: (value: BrowserWindow, index: number, array: BrowserWindow[]) => void) {
  frames.forEach(callback)
}

function broadcast(event: string, ...args: any[]) {
  forEachWindow(frame => {
    frame.webContents.send(event, ...args)
  })
}

function collectWindow(frame: BrowserWindow) {
  frames.push(frame)
  frame.on('closed', () => {
    const index = frames.indexOf(frame)
    if (index !== -1) {
      frames.splice(index, 1)
    }
  })
}

function getFocusedWindow() {
  let frame = BrowserWindow.getFocusedWindow()
  if (!frame) {
    frame = getLastWindow()
    frame.focus()
  }
  return frame
}

export {
  hasWindow,
  getLastWindow,
  forEachWindow,
  broadcast,
  collectWindow,
  getFocusedWindow,
}
