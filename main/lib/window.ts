import * as path from 'path'
import * as url from 'url'
import { effect, stop, unref } from '@vue/reactivity'
import { app, BrowserWindow, ipcMain } from 'electron'
import { loadCustomCSS } from './addon'
import { hasWindow, getLastWindow } from './frame'
import { createWindowMenu } from './menu'
import { handleEvents } from './message'
import { useThemeOptions } from './theme'

function loadHTMLFile(frame: BrowserWindow, file: string) {
  frame.loadURL(url.pathToFileURL(path.resolve(__dirname, file)).href)
}

function createWindow(...args: string[]) {
  const options = {
    show: false,
    title: app.name,
    width: (8 * 80) + (2 * 8) + 180,
    minWidth: (8 * 40) + (2 * 8) + 180,
    height: (17 * 25) + (2 * 4) + 36,
    frame: false,
    titleBarStyle: 'hiddenInset' as const,
    transparent: true,
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
  // gracefully show window
  frame.once('ready-to-show', () => {
    frame.show()
  })
  // insert custom css
  loadCustomCSS(frame)
  // these handler must be bound in main process
  handleEvents(frame)
  // reactive effects
  const reactiveEffect = effect(() => {
    const themeOptions = unref(useThemeOptions())
    if (process.platform !== 'darwin') {
      createWindowMenu(frame)
    }
    frame.setBackgroundColor(themeOptions.backgroundColor)
    frame.setVibrancy(themeOptions.vibrancy ?? null)
  })
  frame.on('closed', () => {
    stop(reactiveEffect)
  })
}

function handleWindowMessages() {
  ipcMain.handle('open-window', () => {
    createWindow()
  })
}

export {
  createWindow,
  handleWindowMessages,
}
