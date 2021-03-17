import './internal/connect'
import { effect } from '@vue/reactivity'
import { app } from 'electron'
import * as commas from '../api/main'
import { loadAddons, loadCustomJS } from './lib/addon'
import { hasWindow, getLastWindow, forEachWindow } from './lib/frame'
import { loadTranslations, handleI18NMessages } from './lib/i18n'
import { handleKeyBindingMessages } from './lib/keybinding'
import { handleLauncherMessages } from './lib/launcher'
import { createApplicationMenu, createDockMenu, handleMenuMessages, createWindowMenu } from './lib/menu'
import { handleMessages } from './lib/message'
import { startServingProtocol, handleProtocolRequest } from './lib/protocol'
import { handleSettingsMessages } from './lib/settings'
import { handleTerminalMessages } from './lib/terminal'
import { handleThemeMessages } from './lib/theme'
import { setupAutoUpdater } from './lib/updater'
import { createWindow, handleWindowMessages } from './lib/window'

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
  await loadTranslations()
  await app.whenReady()
  commas.app.events.emit('ready')
  effect(() => {
    if (process.platform === 'darwin') {
      createApplicationMenu()
      createDockMenu()
    } else {
      forEachWindow(createWindowMenu)
    }
  })
  setupAutoUpdater()
  startServingProtocol()
  createWindow(cwd)
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
