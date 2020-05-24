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
    frame.webContents.send('maximize')
  })
  frame.on('unmaximize', () => {
    frame.webContents.send('unmaximize')
  })
  frame.on('enter-full-screen', () => {
    frame.webContents.send('enter-full-screen')
  })
  frame.on('leave-full-screen', () => {
    frame.webContents.send('leave-full-screen')
  })
}

function transferInvoking() {
  process.on('uncaughtException', error => {
    forEachWindow(frame => frame.webContents.send('uncaught-error', String(error)))
  })
  app.on('before-quit', () => {
    forEachWindow(frame => frame.webContents.send('before-quit'))
  })
  ipcMain.handle('open-window', () => {
    createWindow()
  })
  ipcMain.handle('destroy', (event, data) => {
    BrowserWindow.fromWebContents(event.sender).destroy()
  })
  ipcMain.handle('message-box', (event, data) => {
    return dialog.showMessageBox(
      BrowserWindow.fromWebContents(event.sender),
      data,
    )
  })
  ipcMain.handle('contextmenu', (event, data) => {
    const menu = createMenu(data.template)
    menu.popup({
      window: BrowserWindow.fromWebContents(event.sender),
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
}

module.exports = {
  transferEvents,
  transferInvoking,
}
