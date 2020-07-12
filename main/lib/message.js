const { app, ipcMain, BrowserWindow, dialog } = require('electron')
const childProcess = require('child_process')
const { broadcast } = require('./frame')

function handleMessages() {
  process.on('uncaughtException', error => {
    console.error(error)
    broadcast('uncaught-error', String(error))
  })
  app.on('before-quit', () => {
    broadcast('before-quit')
  })
  ipcMain.handle('get-app-version', (event) => {
    return app.getVersion()
  })
  ipcMain.handle('get-minimized', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    return frame.isMinimized()
  })
  ipcMain.handle('set-minimized', (event, value) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (value) {
      frame.minimize()
    } else {
      frame.restore()
    }
  })
  ipcMain.handle('get-maximized', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    return frame.isMaximized()
  })
  ipcMain.handle('set-maximized', (event, value) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (value) {
      frame.maximize()
    } else {
      frame.unmaximize()
    }
  })
  ipcMain.handle('get-fullscreen', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    return frame.isFullScreen()
  })
  ipcMain.handle('set-fullscreen', (event, value) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    frame.setFullScreen(value)
  })
  ipcMain.handle('message-box', (event, data) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    return dialog.showMessageBox(frame, data)
  })
  ipcMain.handle('destroy', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    frame.destroy()
  })
  ipcMain.handle('spawn-process', (event, command, args) => {
    childProcess.spawn(command, args)
  })
}

function handleEvents(frame) {
  frame.on('minimize', () => {
    frame.webContents.send('minimized-changed', true)
  })
  frame.on('restore', () => {
    frame.webContents.send('minimized-changed', false)
  })
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

module.exports = {
  handleMessages,
  handleEvents,
}
