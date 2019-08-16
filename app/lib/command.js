const {BrowserWindow} = require('electron')

function execCommand(command, frame) {
  if (!frame) {
    frame = BrowserWindow.getFocusedWindow() || frames[frames.length - 1]
    if (!frame) return
  }
  frame.webContents.send('command', command)
}

module.exports = {
  execCommand,
}
