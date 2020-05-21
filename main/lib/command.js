const { BrowserWindow } = require('electron')

/**
 * @param {BrowserWindow} [frame]
 * @param {string} command
 * @param {any} args
 */
function execCommand(frame, command, args) {
  if (!frame) {
    frame = BrowserWindow.getFocusedWindow() || frames[frames.length - 1]
    if (!frame) return
  }
  frame.webContents.send('command', { command, args })
}

module.exports = {
  execCommand,
}
