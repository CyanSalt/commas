import * as path from 'node:path'
import { effect, stop } from '@vue/reactivity'
import type { BrowserWindowConstructorOptions } from 'electron'
import { app, BrowserWindow, ipcMain } from 'electron'
import { globalHandler } from '../../shared/handler'
import { loadCustomCSS } from './addon'
import { getLastWindow, hasWindow } from './frame'
import { createTouchBar, createWindowMenu } from './menu'
import { handleEvents } from './message'
import { useSettings, whenSettingsReady } from './settings'
import { useThemeOptions } from './theme'

const themeOptions = $(useThemeOptions())

async function createWindow(...args: string[]) {
  await whenSettingsReady()
  const settings = useSettings()
  const tabListPosition = settings['terminal.view.tabListPosition']
  const frameType = settings['terminal.view.frameType']
  const options: Partial<BrowserWindowConstructorOptions> = {
    show: false,
    title: app.name,
    width: (8 * 80) + (16 * 2) + (8 * 3) + 176,
    minWidth: (8 * 40) + (16 * 2) + (8 * 3) + 176,
    height: (18 * 24) + (8 * 2) + (tabListPosition === 'top' ? 52 : 36) + (tabListPosition === 'bottom' ? 52 : 32),
    acceptFirstMouse: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      additionalArguments: [
        '--',
        ...args.filter(arg => (arg as string | undefined) !== undefined),
      ],
    },
  }
  if (frameType === 'immersive') {
    options.titleBarStyle = process.platform === 'darwin' ? 'hiddenInset' : 'hidden'
    if (process.platform === 'win32') {
      options.titleBarOverlay = true
    } else if (process.platform === 'linux') {
      options.frame = false
    } else {
      // Transparent window on Windows will lose border and shadow
      options.transparent = true
    }
  }
  // frame offset
  if (hasWindow()) {
    const rect = getLastWindow().getBounds()
    Object.assign(options, {
      x: rect.x + 30,
      y: rect.y + 30,
    })
  }
  const frame = new BrowserWindow(options)
  frame.loadFile(path.resolve(__dirname, '../renderer/index.html'))
  // Gracefully show window
  // Fix shadow issue on macOS
  if (process.platform === 'darwin') {
    /** {@link https://github.com/electron/electron/issues/4472} */
    frame.webContents.once('dom-ready', () => {
      frame.show()
    })
  } else {
    frame.once('ready-to-show', () => {
      frame.show()
    })
  }
  // Insert custom css
  loadCustomCSS(frame)
  // These handler must be bound in main process
  handleEvents(frame)
  // Reactive Effects
  // Some reactive values such as `focusedWindow` may be triggered
  // even if the frame has been destroyed
  const menuEffect = effect(() => {
    if (frame.isDestroyed()) return
    if (process.platform === 'darwin') {
      createTouchBar(frame)
    } else {
      createWindowMenu(frame)
      const latestFrameType = settings['terminal.view.frameType']
      frame.setMenuBarVisibility(latestFrameType === 'system-with-menu')
    }
  })
  const themeEffect = effect(() => {
    if (frame.isDestroyed()) return
    frame.setBackgroundColor(themeOptions.backgroundColor)
    // @ts-expect-error electron type error
    frame.setVibrancy(themeOptions.vibrancy ?? null)
    if (process.platform === 'win32' && frameType === 'immersive') {
      frame.setTitleBarOverlay(themeOptions.titleBarOverlay)
    }
    if (process.platform === 'darwin') {
      frame.setWindowButtonPosition(themeOptions.windowButtonPosition)
    }
  })
  frame.on('closed', () => {
    stop(menuEffect)
    stop(themeEffect)
  })
  return frame
}

let cwd: string

function createDefaultWindow() {
  createWindow(cwd)
}

async function openFile(file: string) {
  await whenSettingsReady()
  const settings = useSettings()
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
  frame.show()
}

function handleWindowMessages() {
  ipcMain.handle('open-window', () => {
    createWindow()
  })
  globalHandler.handle('global:open-window', () => {
    createWindow()
  })
  globalHandler.handle('global:look-up', (text: string, frame?: BrowserWindow) => {
    frame?.webContents.showDefinitionForSelection()
  })
}

export {
  createWindow,
  createDefaultWindow,
  openFile,
  handleWindowMessages,
}
