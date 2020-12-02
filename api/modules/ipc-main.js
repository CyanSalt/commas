const { ipcMain } = require('electron')

function on(channel, listener) {
  ipcMain.on(channel, listener)
  this.$.app.onInvalidate(() => {
    ipcMain.removeListener(channel, listener)
  })
}

function handle(channel, listener) {
  ipcMain.handle(channel, listener)
  this.$.app.onInvalidate(() => {
    ipcMain.removeHandler(channel)
  })
}

module.exports = {
  on,
  handle,
}
