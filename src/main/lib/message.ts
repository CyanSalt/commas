import type { Dock, FindInPageOptions, MessageBoxOptions, MessageBoxReturnValue, NativeImage, Result, WebContents } from 'electron'
import { app, BrowserWindow, dialog, nativeImage, shell } from 'electron'
import * as fileIcon from 'file-icon'
import { ipcMain } from '@commas/electron-ipc'
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
    'drag-file': (path: string, iconBuffer?: Buffer) => void,
    beep: () => void,
    'get-icon': (path: string) => Buffer,
    notify: typeof notify,
    'activate-window': () => void,
    bounce: (state: { active: boolean, type?: Parameters<Dock['bounce']>[0] }) => void,
    find: (text: string, options?: FindInPageOptions) => Result,
    'stop-finding': (type: Parameters<WebContents['stopFindInPage']>[0]) => void,
    'read-file': typeof readFile,
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
    if (!frame) return undefined as never
    return dialog.showMessageBox(frame, data)
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
  ipcMain.handle('drag-file', async (event, path, iconBuffer) => {
    let icon: NativeImage
    if (iconBuffer) {
      icon = nativeImage.createFromBuffer(iconBuffer).resize({ width: 16 })
    } else {
      icon = await app.getFileIcon(path, { size: 'small' })
    }
    event.sender.startDrag({ file: path, icon })
  })
  ipcMain.handle('beep', () => {
    shell.beep()
  })
  ipcMain.handle('get-icon', (event, path: string) => {
    return fileIcon.buffer(path, { size: 32 })
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
    const foundInPage = until(event.sender, 'found-in-page') as Promise<[unknown, Result]>
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

export {
  handleMessages,
  handleEvents,
}
