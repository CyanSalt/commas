const { ipcMain } = require('electron')

function on(channel, listener) {
  ipcMain.on(channel, listener)
  this.$.app.onCleanup(() => {
    ipcMain.removeListener(channel, listener)
  })
}

function handle(channel, listener) {
  ipcMain.handle(channel, listener)
  this.$.app.onCleanup(() => {
    ipcMain.removeHandler(channel)
  })
}

module.exports = {
  on,
  handle,
}
