import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { ipcMain } from 'electron'

function on(channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) {
  ipcMain.on(channel, listener)
  this.$.app.onCleanup(() => {
    ipcMain.removeListener(channel, listener)
  })
}

function handle(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => void) {
  ipcMain.handle(channel, listener)
  this.$.app.onCleanup(() => {
    ipcMain.removeHandler(channel)
  })
}

export {
  on,
  handle,
}
