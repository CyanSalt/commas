import type { Ref } from '@vue/reactivity'
import type { IpcMainEvent, IpcMainInvokeEvent } from 'electron'
import { ipcMain } from 'electron'
import { provideIPC } from '../../src/main/utils/compositions'
import type { MainAPIContext } from '../types'

function on(this: MainAPIContext, channel: string, listener: (event: IpcMainEvent, ...args: any[]) => void) {
  ipcMain.on(channel, listener)
  this.$.app.onInvalidate(() => {
    ipcMain.removeListener(channel, listener)
  })
}

function handle(this: MainAPIContext, channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => void) {
  ipcMain.handle(channel, listener)
  this.$.app.onInvalidate(() => {
    ipcMain.removeHandler(channel)
  })
}

function provide<T>(this: MainAPIContext, key: string, valueRef: Ref<T>) {
  const cleanup = provideIPC(key, valueRef)
  this.$.app.onInvalidate(() => {
    cleanup()
  })
}

export * from '../shim'

export {
  on,
  handle,
  provide,
}
