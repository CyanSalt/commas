const {BrowserWindow} = require('electron')

function execCommand(frame, command, args) {
  if (!frame) {
    frame = BrowserWindow.getFocusedWindow() || frames[frames.length - 1]
    if (!frame) return
  }
  frame.webContents.send('command', {command, args})
}

module.exports = {
  execCommand,
}
