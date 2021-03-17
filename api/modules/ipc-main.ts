import type { Ref } from '@vue/reactivity'
import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { ipcMain } from 'electron'
import { provideIPC } from '../../main/utils/hooks'
import type { CommasContext } from '../types'

function on(this: CommasContext, channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) {
  ipcMain.on(channel, listener)
  this.$.app.onCleanup(() => {
    ipcMain.removeListener(channel, listener)
  })
}

function handle(this: CommasContext, channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => void) {
  ipcMain.handle(channel, listener)
  this.$.app.onCleanup(() => {
    ipcMain.removeHandler(channel)
  })
}

function provide<T>(this: CommasContext, key: string, valueRef: Ref<T>) {
  const cleanup = provideIPC(key, valueRef)
  this.$.app.onCleanup(() => {
    cleanup()
  })
}

export {
  on,
  handle,
  provide,
}
