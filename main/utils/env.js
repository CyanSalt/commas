const { app, ipcRenderer } = require('electron')

function isMainProcess() {
  return process.type === 'browser'
}

function isPackaged() {
  return isMainProcess()
    ? app.isPackaged
    : process.argv.some(arg => arg.startsWith('--app-path=') && arg.endsWith('app.asar'))
}

function getPath(name) {
  return isMainProcess()
    ? app.getPath(name)
    : ipcRenderer.sendSync('get-path', name)
}

module.exports = {
  isMainProcess,
  isPackaged,
  getPath,
}
