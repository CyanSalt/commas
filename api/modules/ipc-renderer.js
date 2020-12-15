const { ipcRenderer } = require('electron')

function on(channel, listener) {
  ipcRenderer.on(channel, listener)
  this.$.app.onCleanup(() => {
    ipcRenderer.removeListener(channel, listener)
  })
}

module.exports = {
  on,
}
