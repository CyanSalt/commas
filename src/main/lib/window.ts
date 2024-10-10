import * as path from 'node:path'
import { effect, stop } from '@vue/reactivity'
import type { BrowserWindowConstructorOptions, Rectangle } from 'electron'
import { app, BrowserWindow, WebContentsView } from 'electron'
import { ipcMain } from '@commas/electron-ipc'
import { globalHandler } from '../../shared/handler'
import { loadCustomCSS } from './addon'
import { getLastWindow, hasWindow, send } from './frame'
import { createTouchBar, createWindowMenu } from './menu'
import { handleEvents, handleViewEvents } from './message'
import { useSettings, whenSettingsReady } from './settings'
import { useThemeOptions } from './theme'

declare module '@commas/electron-ipc' {
  export interface GlobalCommands {
    'global-main:open-window': () => void,
  }
  export interface Commands {
    'create-web-contents': (rect: Rectangle) => number,
    'destroy-web-contents': (id: number) => void,
    'navigate-web-contents': (id: number, url: string) => void,
    'resize-web-contents': (id: number, rect: Rectangle) => void,
    'go-to-offset-web-contents': (id: number, offset: number) => void,
  }
}

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
  send(frame.webContents, 'open-tab', { cwd: file })
  frame.show()
}

const webContentsViews = new Set<WebContentsView>()

function handleWindowMessages() {
  globalHandler.handle('global-main:open-window', () => {
    createWindow()
  })
  ipcMain.handle('create-web-contents', (event, rect) => {
    const frame = BrowserWindow.fromWebContents(event.sender)!
    const view = new WebContentsView()
    view.setBounds(rect)
    frame.contentView.addChildView(view)
    webContentsViews.add(view)
    handleViewEvents(view, event.sender)
    return view.webContents.id
  })
  ipcMain.handle('destroy-web-contents', (event, id) => {
    const frame = BrowserWindow.fromWebContents(event.sender)!
    const view = Array.from(webContentsViews).find(item => item.webContents.id === id)
    if (!view) return
    webContentsViews.delete(view)
    frame.contentView.removeChildView(view)
    view.webContents.close()
  })
  ipcMain.handle('navigate-web-contents', (event, id, url) => {
    const view = Array.from(webContentsViews).find(item => item.webContents.id === id)
    if (!view) return
    view.webContents.loadURL(url)
  })
  ipcMain.handle('resize-web-contents', (event, id, rect) => {
    const view = Array.from(webContentsViews).find(item => item.webContents.id === id)
    if (!view) return
    view.setBounds(rect)
  })
  ipcMain.handle('go-to-offset-web-contents', (event, id, offset) => {
    const view = Array.from(webContentsViews).find(item => item.webContents.id === id)
    if (!view) return
    view.webContents.navigationHistory.goToOffset(offset)
  })
}

export {
  createWindow,
  createDefaultWindow,
  openFile,
  handleWindowMessages,
}
