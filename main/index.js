const { app } = require('electron')
const commas = require('../api/main')
const { loadAddons, loadCustomJS } = require('./lib/addon')
const { hasWindow, getLastWindow, forEachWindow } = require('./lib/frame')
const { loadTranslation, handleI18NMessages, getI18NEvents } = require('./lib/i18n')
const { handleKeyBindingMessages } = require('./lib/keybinding')
const { handleLauncherMessages } = require('./lib/launcher')
const { createApplicationMenu, createDockMenu, handleMenuMessages, createWindowMenu } = require('./lib/menu')
const { handleMessages } = require('./lib/message')
const { startServingProtocol, handleProtocolRequest } = require('./lib/protocol')
const { handleSettingsMessages } = require('./lib/settings')
const { handleTerminalMessages } = require('./lib/terminal')
const { handleThemeMessages } = require('./lib/theme')
const { setupAutoUpdater } = require('./lib/updater')
const { createWindow, handleWindowMessages } = require('./lib/window')

handleMessages()
handleI18NMessages()
handleMenuMessages()
handleWindowMessages()
handleSettingsMessages()
handleThemeMessages()
handleTerminalMessages()
handleLauncherMessages()
handleKeyBindingMessages()

let cwd
async function initialize() {
  await loadAddons()
  loadCustomJS()
  await app.whenReady()
  await loadTranslation(app.getLocale())
  commas.app.events.emit('ready')
  if (process.platform === 'darwin') {
    createApplicationMenu()
    createDockMenu()
  }
  setupAutoUpdater()
  startServingProtocol()
  createWindow(cwd)
  // Refresh menu when dictionary updated
  const events = getI18NEvents()
  events.on('updated', () => {
    if (process.platform === 'darwin') {
      createApplicationMenu()
      createDockMenu()
    } else {
      forEachWindow(createWindowMenu)
    }
  })
}

initialize()

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
      const frame = getLastWindow()
      frame.webContents.send('open-tab', { cwd: file })
    } else {
      createWindow(file)
    }
  })
  // handle custom protocol
  app.on('open-url', (event, url) => {
    event.preventDefault()
    handleProtocolRequest(url)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  commas.app.unloadAddons()
  commas.app.events.emit('unload')
})
