import { BrowserWindow } from 'electron'

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
  broadcast,
  getFocusedWindow,
}
