const { app } = require('electron')
const { createWindow } = require('./lib/window')
const { createApplicationMenu, createDockMenu } = require('./lib/menu')
const { hasWindow, getLastWindow } = require('./lib/frame')
const { transferInvoking } = require('./lib/transfer')
const { checkForUpdates } = require('./lib/updater')
const { loadTranslation } = require('./build')

transferInvoking()

let cwd
app.on('ready', () => {
  loadTranslation(app.getLocale())
  if (process.platform === 'darwin') {
    createApplicationMenu()
    createDockMenu()
  }
  checkForUpdates()
  createWindow(cwd)
})

app.on('activate', () => {
  if (!hasWindow() && app.isReady()) {
    createWindow()
  }
})

app.on('will-finish-launching', () => {
  // handle opening outside
  app.on('open-file', (event, file) => {
    event.preventDefault()
    // for Windows
    if (!file) {
      file = process.argv[process.argv.length - 1]
    }
    if (!app.isReady()) {
      cwd = file
    } else if (hasWindow()) {
      const last = getLastWindow()
      last.webContents.send('open-path', file)
    } else {
      createWindow(file)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
