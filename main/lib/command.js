const { BrowserWindow } = require('electron')
const { getLastWindow } = require('./frame')

/**
 * @param {BrowserWindow} [frame]
 * @param {string} command
 * @param {any} args
 */
function execCommand(frame, command, args) {
  if (!frame) {
    frame = BrowserWindow.getFocusedWindow() || getLastWindow()
    if (!frame) return
  }
  frame.webContents.send('command', { command, args })
}

module.exports = {
  execCommand,
}
