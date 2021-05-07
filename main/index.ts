import './utils/connect'
import { effect, unref } from '@vue/reactivity'
import { app } from 'electron'
import * as commas from '../api/main'
import { loadAddons, loadCustomJS } from './lib/addon'
import { hasWindow, getLastWindow } from './lib/frame'
import { loadTranslations, handleI18NMessages } from './lib/i18n'
import { handleKeyBindingMessages } from './lib/keybinding'
import { handleLauncherMessages } from './lib/launcher'
import { createApplicationMenu, createDockMenu, handleMenuMessages } from './lib/menu'
import { handleMessages } from './lib/message'
import { startServingProtocol, handleProtocolRequest } from './lib/protocol'
import { handleSettingsMessages, useSettings, whenSettingsReady } from './lib/settings'
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
  if (process.platform === 'darwin') {
    effect(() => {
      createApplicationMenu()
      createDockMenu()
    })
  }
  setupAutoUpdater()
  startServingProtocol()
  createWindow(cwd)
}

initialize()

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows && app.isReady()) {
    createWindow()
  }
})

app.on('will-finish-launching', () => {
  // handle opening outside
  app.on('open-file', async (event, file) => {
    event.preventDefault()
    const settingsRef = useSettings()
    await whenSettingsReady()
    const settings = unref(settingsRef)
    // for Windows
    if (!file) {
      file = process.argv[process.argv.length - 1]
    }
    if (!app.isReady()) {
      cwd = file
      return
    }
    if (settings['terminal.external.openPathIn'] === 'new-window' || !hasWindow()) {
      createWindow(file)
      return
    }
    const frame = getLastWindow()
    frame.webContents.send('open-tab', { cwd: file })
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
