const {app, ipcMain} = require('electron')
const {forEachWindow} = require('./frame')
const {createWindow} = require('./window')

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
  app.on('before-quit', () => {
    forEachWindow(frame => frame.webContents.send('before-quit'))
  })
  ipcMain.on('open-window', () => {
    createWindow()
  })
}

module.exports = {
  transferEvents,
  transferInvoking,
}
