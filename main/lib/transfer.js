const { app, ipcMain, BrowserWindow, nativeTheme, dialog } = require('electron')
const { forEachWindow } = require('./frame')
const { createWindow } = require('./window')
const { createMenu } = require('./menu')
const { toggleAutoUpdater } = require('./updater')

/**
 * @param {BrowserWindow} frame
 */
function transferEvents(frame) {
  frame.on('maximize', () => {
    frame.webContents.send('maximized-changed', true)
  })
  frame.on('unmaximize', () => {
    frame.webContents.send('maximized-changed', false)
  })
  frame.on('enter-full-screen', () => {
    frame.webContents.send('fullscreen-changed', true)
  })
  frame.on('leave-full-screen', () => {
    frame.webContents.send('fullscreen-changed', false)
  })
}

function transferInvoking() {
  process.on('uncaughtException', error => {
    console.log('error', error)
    forEachWindow(frame => frame.webContents.send('uncaught-error', String(error)))
  })
  app.on('before-quit', () => {
    forEachWindow(frame => frame.webContents.send('before-quit'))
  })
  ipcMain.handle('open-window', () => {
    createWindow()
  })
  ipcMain.handle('destroy', (event, data) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    frame.destroy()
  })
  ipcMain.handle('message-box', (event, data) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    return dialog.showMessageBox(frame, data)
  })
  ipcMain.handle('contextmenu', (event, data) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    const menu = createMenu(data.template)
    menu.popup({
      window: frame,
      x: data.position.x,
      y: data.position.y,
    })
  })
  ipcMain.handle('toggle-auto-updater', (event, data) => {
    toggleAutoUpdater(data)
  })
  ipcMain.handle('update-theme', (event, source) => {
    nativeTheme.themeSource = source
  })
  ipcMain.handle('toggle-minimized', event => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (frame.isMinimized()) {
      frame.restore()
    } else {
      frame.minimize()
    }
  })
  ipcMain.handle('toggle-maximized', event => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (frame.isMaximized()) {
      frame.unmaximize()
    } else {
      frame.maximize()
    }
  })
}

module.exports = {
  transferEvents,
  transferInvoking,
}
