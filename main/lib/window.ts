import * as path from 'path'
import * as url from 'url'
import type { BrowserWindowConstructorOptions } from 'electron'
import { app, BrowserWindow, ipcMain } from 'electron'
import { loadCustomCSS } from './addon'
import { hasWindow, getLastWindow, collectWindow, forEachWindow } from './frame'
import { createWindowMenu } from './menu'
import { handleEvents } from './message'
import { getSettings } from './settings'

interface BrowserWindowThemeOptions {
  backgroundColor: string,
  vibrancy: BrowserWindowConstructorOptions['vibrancy'],
}

let themeOptions: BrowserWindowThemeOptions = {
  /** {@link https://github.com/electron/electron/issues/10420} */
  backgroundColor: '#00000000',
  vibrancy: undefined,
}

function setThemeOptions(options: BrowserWindowThemeOptions) {
  themeOptions = options
  forEachWindow(frame => {
    frame.setBackgroundColor(options.backgroundColor)
    frame.setVibrancy(options.vibrancy ?? null)
  })
}

function loadHTMLFile(frame: BrowserWindow, file: string) {
  frame.loadURL(url.pathToFileURL(path.resolve(__dirname, file)).href)
}

async function createWindow(...args: string[]) {
  const settings = await getSettings()
  const shouldUseSystemFrame = settings['terminal.style.frame'] === 'system'
  const options = {
    show: false,
    title: app.name,
    width: (8 * 80) + (2 * 8) + 180,
    minWidth: (8 * 40) + (2 * 8) + 180,
    height: (17 * 25) + (2 * 4) + 36,
    frame: shouldUseSystemFrame,
    titleBarStyle: shouldUseSystemFrame ? 'default' as const : 'hiddenInset' as const,
    transparent: !shouldUseSystemFrame,
    ...themeOptions,
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
  // frame offset
  if (hasWindow()) {
    const rect = getLastWindow().getBounds()
    Object.assign(options, {
      x: rect.x + 30,
      y: rect.y + 30,
    })
  }
  const frame = new BrowserWindow(options)
  // Fix shadow issue on macOS
  if (process.platform === 'darwin') {
    frame.setSize(options.width - 1, options.height - 1)
    frame.setWindowButtonVisibility(false)
    frame.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        frame.setSize(options.width, options.height)
        frame.setWindowButtonVisibility(true)
      }, 500)
    })
  }
  loadHTMLFile(frame, '../../renderer/index.html')
  if (process.platform !== 'darwin') {
    createWindowMenu(frame)
  }
  // gracefully show window
  frame.once('ready-to-show', () => {
    frame.show()
  })
  // insert custom css
  loadCustomCSS(frame)
  // these handler must be bound in main process
  handleEvents(frame)
  // reference to avoid GC
  collectWindow(frame)
}

function handleWindowMessages() {
  ipcMain.handle('open-window', () => {
    return createWindow()
  })
}

export {
  setThemeOptions,
  createWindow,
  handleWindowMessages,
}
