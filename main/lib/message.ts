import type { MessageBoxOptions } from 'electron'
import { app, ipcMain, BrowserWindow, dialog } from 'electron'
import { execa } from '../utils/helper'
import { broadcast } from './frame'

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
  ipcMain.handle('get-app-version', (event) => {
    return app.getVersion()
  })
  ipcMain.handle('get-minimized', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return false
    return frame.isMinimized()
  })
  ipcMain.handle('set-minimized', (event, value: boolean) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    if (value) {
      frame.minimize()
    } else {
      frame.restore()
    }
  })
  ipcMain.handle('get-maximized', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return false
    return frame.isMaximized()
  })
  ipcMain.handle('set-maximized', (event, value: boolean) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return
    if (value) {
      frame.maximize()
    } else {
      frame.unmaximize()
    }
  })
  ipcMain.handle('get-fullscreen', (event) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    if (!frame) return false
    return frame.isFullScreen()
  })
  ipcMain.handle('set-fullscreen', (event, value: boolean) => {
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
  ipcMain.handle('execute', (event, command, args) => {
    return execa(command, args)
  })
  ipcMain.handle('inject-style', (event, style: string) => {
    return event.sender.insertCSS(style)
  })
  ipcMain.handle('eject-style', (event, key: string) => {
    return event.sender.removeInsertedCSS(key)
  })
}

function handleEvents(frame: BrowserWindow) {
  frame.on('minimize', () => {
    frame.webContents.send('minimized-changed', true)
  })
  frame.on('restore', () => {
    frame.webContents.send('minimized-changed', false)
  })
  frame.on('maximize', () => {
    frame.webContents.send('maximized-changed', true)
  })
  frame.on('unmaximize', () => {
    frame.webContents.send('maximized-changed', false)
  })
  frame.on('enter-full-screen', () => {
    frame.webContents.send('fullscreen-changed', true)
  })
  frame.on('leave-full-screen', () => {
    frame.webContents.send('fullscreen-changed', false)
  })
}

export {
  handleMessages,
  handleEvents,
}
