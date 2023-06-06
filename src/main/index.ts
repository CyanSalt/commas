import { effect } from '@vue/reactivity'
import { app } from 'electron'
import * as commas from '../../api/core-main'
import { handleA11yMessages } from './lib/a11y'
import { handleAddonMessages, loadAddons, loadCustomJS } from './lib/addon'
import { hasWindow, getLastWindow } from './lib/frame'
import { loadTranslations, handleI18nMessages } from './lib/i18n'
import { createApplicationMenu, createDockMenu, handleMenuMessages, registerGlobalShortcuts } from './lib/menu'
import { handleMessages } from './lib/message'
import { handleSettingsMessages } from './lib/settings'
import { handleTerminalMessages } from './lib/terminal'
import { handleThemeMessages } from './lib/theme'
import { createDefaultWindow, createWindow, handleWindowMessages, openFile } from './lib/window'

handleMessages()
handleI18nMessages()
handleMenuMessages()
handleWindowMessages()
handleAddonMessages()
handleSettingsMessages()
handleThemeMessages()
handleTerminalMessages()
handleA11yMessages()

async function initialize() {
  loadAddons()
  loadCustomJS()
  await loadTranslations()
  await app.whenReady()
  commas.proxy.app.events.emit('ready')
  app.setAsDefaultProtocolClient('commas')
  registerGlobalShortcuts()
  if (process.platform === 'darwin') {
    effect(() => {
      createApplicationMenu()
      createDockMenu()
    })
  }
  createDefaultWindow()
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
    // for Windows
    if (!file) {
      file = process.argv[process.argv.length - 1]
    }
    openFile(file)
  })
  app.on('open-url', async (event, url) => {
    event.preventDefault()
    await app.whenReady()
    if (!hasWindow()) {
      createWindow()
    }
    const frame = getLastWindow()
    frame.webContents.send('open-url', url)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('will-quit', () => {
  commas.addon.unloadAddons()
  commas.proxy.app.events.emit('unload')
})
