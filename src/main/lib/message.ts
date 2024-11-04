import type EventEmitter from 'node:events'
import * as fs from 'node:fs'
import * as path from 'node:path'
import type { Dock, FindInPageOptions, MessageBoxOptions, MessageBoxReturnValue, NativeImage, Result, WebContents, WebContentsView } from 'electron'
import { app, BrowserWindow, clipboard, dialog, nativeImage, shell } from 'electron'
import * as fileIcon from 'file-icon'
import { ipcMain } from '@commas/electron-ipc'
import { globalHandler } from '../../shared/handler'
import { readFile, watchFile, writeFile } from '../utils/file'
import { execa, until } from '../utils/helper'
import { notify } from '../utils/notification'
import { broadcast, hasWindow, send } from './frame'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'message-box': (data: MessageBoxOptions) => MessageBoxReturnValue,
    destroy: () => void,
    execute: typeof execa,
    'inject-style': (style: string) => string,
    'eject-style': (key: string) => void,
    'update-window': (data: { title: BrowserWindow['title'], filename: BrowserWindow['representedFilename'] }) => void,
    'drag-file': (file: string, iconBuffer?: Buffer) => void,
    beep: () => void,
    'get-icon': (file: string) => Buffer,
    notify: typeof notify,
    'activate-window': () => void,
    bounce: (state: { active: boolean, type?: Parameters<Dock['bounce']>[0] }) => void,
    find: (text: string, options?: FindInPageOptions) => Result,
    'stop-finding': (type: Parameters<WebContents['stopFindInPage']>[0]) => void,
    'read-file': typeof readFile,
    'show-file': (file: string) => void,
    'preview-file': (file: string) => void,
    'open-path': (uri: string) => void,
    'open-url': (uri: string) => void,
    'save-file': (name: string, content: Buffer | string) => Promise<string>,
  }
  export interface Events {
    'get-path': (name?: Parameters<typeof app['getPath']>[0]) => string,
    'get-version': typeof app.getVersion,
  }
  export interface Refs {
    minimized: boolean,
    maximized: boolean,
    fullscreen: boolean,
    file: string | undefined,
  }
  export interface GlobalCommands {
    'global-main:look-up': (text: string, frame?: BrowserWindow) => void,
    'global-main:copy': (text: string) => void,
    'global-main:open-url': (url: string) => void,
  }
  export interface RendererEvents {
    'view-title-updated': (id: number, title: string) => void,
    'view-icon-updated': (id: number, icon: string | undefined) => void,
    'view-url-updated': (id: number, url: string, canGoBack: boolean) => void,
    'view-loading-updated': (id: number, loading: boolean) => void,
    'view-open-url': (url: string) => void,
  }
}

let currentBouncingId = -1

function reportError(error: Error) {
  console.error(error)
  if (hasWindow()) {
    broadcast('uncaught-error', error.stack ?? error.message)
  } else {
    dialog.showErrorBox(error.name, error.stack ?? error.message)
  }
}

function handleMessages() {
  process.on('uncaughtException', error => {
    reportError(error)
  })
  process.on('unhandledRejection', (error: Error) => {
    reportError(error)
  })
  app.on('before-quit', () => {
    broadcast('before-quit')
  })
  ipcMain.on('get-path', (event, name?: Parameters<typeof app['getPath']>[0]) => {
    event.returnValue = name ? app.getPath(name) : app.getAppPath()
  })
  ipcMain.on('get-version', (event) => {
    event.returnValue = app.getVersion()
  })
  ipcMain.handle('get-ref:minimized', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return false
    return frame.isMinimized()
  })
  ipcMain.handle('set-ref:minimized', (event, value) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    if (value) {
      frame.minimize()
    } else {
      frame.restore()
    }
  })
  ipcMain.handle('get-ref:maximized', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return false
    return frame.isMaximized()
  })
  ipcMain.handle('set-ref:maximized', (event, value) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    if (value) {
      frame.maximize()
    } else {
      frame.unmaximize()
    }
  })
  ipcMain.handle('get-ref:fullscreen', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return false
    return frame.isFullScreen()
  })
  ipcMain.handle('set-ref:fullscreen', (event, value) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    frame.setFullScreen(value)
  })
  ipcMain.handle('message-box', (event, data) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    return frame
      ? dialog.showMessageBox(frame, data)
      : dialog.showMessageBox(data)
  })
  ipcMain.handle('destroy', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    frame.destroy()
  })
  ipcMain.handle('execute', (event, command) => {
    return execa(command)
  })
  ipcMain.handle('inject-style', (event, style) => {
    return event.sender.insertCSS(style)
  })
  ipcMain.handle('eject-style', (event, key) => {
    return event.sender.removeInsertedCSS(key)
  })
  ipcMain.handle('update-window', (event, data) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    frame.title = data.title
    frame.representedFilename = data.filename
  })
  ipcMain.handle('drag-file', async (event, file, iconBuffer) => {
    let icon: NativeImage
    if (iconBuffer) {
      icon = nativeImage.createFromBuffer(iconBuffer).resize({ width: 16 })
    } else {
      icon = await app.getFileIcon(file, { size: 'small' })
    }
    event.sender.startDrag({ file, icon })
  })
  ipcMain.handle('beep', () => {
    shell.beep()
  })
  ipcMain.handle('get-icon', (event, file) => {
    return fileIcon.buffer(file, { size: 32 })
  })
  ipcMain.handle('notify', (event, data) => {
    return notify(data)
  })
  ipcMain.handle('activate-window', event => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    frame.show()
  })
  ipcMain.handle('bounce', (event, { active, type }) => {
    if (active) {
      if (process.platform === 'darwin') {
        currentBouncingId = app.dock.bounce(type)
      } else {
        const frame = BrowserWindow.fromWebContents(event.sender)
        if (!frame) return
        frame.flashFrame(true)
      }
    } else {
      if (process.platform === 'darwin') {
        app.dock.cancelBounce(currentBouncingId)
        currentBouncingId = -1
      } else {
        const frame = BrowserWindow.fromWebContents(event.sender)
        if (!frame) return
        frame.flashFrame(false)
      }
    }
  })
  ipcMain.handle('find', async (event, text, options) => {
    const foundInPage = until(event.sender as unknown as EventEmitter<{ 'found-in-page': [unknown, Result] }>, 'found-in-page')
    event.sender.findInPage(text, options)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fountInPageEvent, result] = await foundInPage
    return result
  })
  ipcMain.handle('stop-finding', (event, action) => {
    event.sender.stopFindInPage(action)
  })
  ipcMain.handle('read-file', (event, file) => {
    return readFile(file)
  })
  ipcMain.handle('show-file', (event, file) => {
    shell.showItemInFolder(file)
  })
  ipcMain.handle('preview-file', (event, file) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    frame.previewFile(file)
  })
  ipcMain.handle('open-path', (event, uri) => {
    shell.openPath(uri)
  })
  ipcMain.handle('open-url', (event, url) => {
    shell.openExternal(url)
  })
  ipcMain.handle('save-file', async (event, name, content) => {
    const file = path.join(app.getPath('downloads'), name)
    await fs.promises.writeFile(file, content)
    return file
  })
  let watcherCollections = new WeakMap<WebContents, Map<string, any>>()
  ipcMain.handle('get-ref:file', (event, file: string) => {
    let watchers = watcherCollections.get(event.sender)
    if (!watchers) {
      watchers = new Map<string, any>()
      watcherCollections.set(event.sender, watchers)
    }
    if (!watchers.has(file)) {
      const watcher = watchFile(file, async () => {
        send(event.sender, 'update-ref:file', await readFile(file), file)
      })
      watchers.set(file, watcher)
    }
    return readFile(file)
  })
  ipcMain.handle('set-ref:file', (event, content, file: string) => {
    return writeFile(file, content)
  })
  ipcMain.on('stop-ref:file', (event, file: string) => {
    const watchers = watcherCollections.get(event.sender)
    if (watchers) {
      watchers.delete(file)
    }
  })
  globalHandler.handle('global-main:look-up', (text, frame) => {
    frame?.webContents.showDefinitionForSelection()
  })
  globalHandler.handle('global-main:copy', text => {
    clipboard.writeText(text)
  })
  globalHandler.handle('global-main:open-url', url => {
    shell.openExternal(url)
  })
}

function handleEvents(frame: BrowserWindow) {
  frame.on('minimize', () => {
    send(frame.webContents, 'update-ref:minimized', true)
  })
  frame.on('restore', () => {
    send(frame.webContents, 'update-ref:minimized', false)
  })
  frame.on('maximize', () => {
    send(frame.webContents, 'update-ref:maximized', true)
  })
  frame.on('unmaximize', () => {
    send(frame.webContents, 'update-ref:maximized', false)
  })
  frame.on('enter-full-screen', () => {
    send(frame.webContents, 'update-ref:fullscreen', true)
  })
  frame.on('leave-full-screen', () => {
    send(frame.webContents, 'update-ref:fullscreen', false)
  })
  if (process.platform === 'darwin') {
    frame.on('move', () => {
      frame.invalidateShadow()
    })
    frame.on('resize', () => {
      frame.invalidateShadow()
    })
  }
}

function handleViewEvents(view: WebContentsView, parent: WebContents) {
  view.webContents.setWindowOpenHandler((details) => {
    send(parent, 'view-open-url', details.url)
    return { action: 'deny' }
  })
  view.webContents.on('page-title-updated', (event, title) => {
    send(parent, 'view-title-updated', view.webContents.id, title)
  })
  view.webContents.on('page-favicon-updated', (event, icons) => {
    send(parent, 'view-icon-updated', view.webContents.id, icons[icons.length - 1])
  })
  view.webContents.on('did-start-navigation', (details) => {
    send(parent, 'view-url-updated', view.webContents.id, details.url, view.webContents.navigationHistory.canGoBack())
  })
  view.webContents.on('did-start-loading', () => {
    send(parent, 'view-loading-updated', view.webContents.id, true)
  })
  view.webContents.on('did-stop-loading', () => {
    send(parent, 'view-loading-updated', view.webContents.id, false)
  })
}

export {
  handleMessages,
  handleEvents,
  handleViewEvents,
}
