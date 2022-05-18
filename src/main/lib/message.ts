import { app, BrowserWindow, dialog, ipcMain, nativeImage, shell } from 'electron'
import type { MessageBoxOptions, NativeImage } from 'electron'
import * as fileIcon from 'file-icon'
import { execa, until } from '../utils/helper'
import { notify } from '../utils/notification'
import { broadcast } from './frame'

let currentBouncingId = -1

function handleMessages() {
  process.on('uncaughtException', error => {
    console.error(error)
    broadcast('uncaught-error', String(error))
  })
  process.on('unhandledRejection', (error: Error) => {
    console.error(error)
    broadcast('uncaught-error', String(error))
  })
  app.on('before-quit', () => {
    broadcast('before-quit')
  })
  ipcMain.on('get-path', (event, name: Parameters<typeof app['getPath']>[0]) => {
    event.returnValue = app.getPath(name)
  })
  ipcMain.on('get-version', (event) => {
    event.returnValue = app.getVersion()
  })
  ipcMain.on('bootstrap', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    const [width, height] = frame.getSize()
    frame.setSize(width - 1, height - 1)
    frame.setSize(width, height)
  })
  ipcMain.handle('get-ref:minimized', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return false
    return frame.isMinimized()
  })
  ipcMain.handle('set-ref:minimized', (event, value: boolean) => {
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
  ipcMain.handle('set-ref:maximized', (event, value: boolean) => {
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
  ipcMain.handle('set-ref:fullscreen', (event, value: boolean) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    frame.setFullScreen(value)
  })
  ipcMain.handle('message-box', (event, data: MessageBoxOptions) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
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
  ipcMain.handle('inject-style', (event, style: string) => {
    return event.sender.insertCSS(style)
  })
  ipcMain.handle('eject-style', (event, key: string) => {
    return event.sender.removeInsertedCSS(key)
  })
  ipcMain.handle('update-window', (event, data: { title: string, directory: string }) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return false
    frame.title = data.title
    frame.representedFilename = data.directory
  })
  ipcMain.handle('drag-file', async (event, path: string, iconBuffer?: Buffer) => {
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
    if (!frame) return false
    frame.show()
  })
  ipcMain.handle('bounce', (event, { active, type }) => {
    if (active) {
      if (process.platform === 'darwin') {
        currentBouncingId = app.dock.bounce(type)
      } else {
        const frame = BrowserWindow.fromWebContents(event.sender)
        if (!frame) return false
        frame.flashFrame(true)
      }
    } else {
      if (process.platform === 'darwin') {
        app.dock.cancelBounce(currentBouncingId)
        currentBouncingId = -1
      } else {
        const frame = BrowserWindow.fromWebContents(event.sender)
        if (!frame) return false
        frame.flashFrame(false)
      }
    }
  })
  ipcMain.handle('find', async (event, text, options) => {
    const foundInPage = until(event.sender, 'found-in-page')
    event.sender.findInPage(text, options)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [fountInPageEvent, result] = await foundInPage
    return result
  })
  ipcMain.handle('stop-finding', (event, action) => {
    event.sender.stopFindInPage(action)
  })
}

function handleEvents(frame: BrowserWindow) {
  frame.on('minimize', () => {
    frame.webContents.send('update-ref:minimized', true)
  })
  frame.on('restore', () => {
    frame.webContents.send('update-ref:minimized', false)
  })
  frame.on('maximize', () => {
    frame.webContents.send('update-ref:maximized', true)
  })
  frame.on('unmaximize', () => {
    frame.webContents.send('update-ref:maximized', false)
  })
  frame.on('enter-full-screen', () => {
    frame.webContents.send('update-ref:fullscreen', true)
  })
  frame.on('leave-full-screen', () => {
    frame.webContents.send('update-ref:fullscreen', false)
  })
}

export {
  handleMessages,
  handleEvents,
}