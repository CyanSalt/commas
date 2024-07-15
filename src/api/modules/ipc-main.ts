import type { Ref } from '@vue/reactivity'
import type { WebContents } from 'electron'
import type { CommandDefinitions, EventDefinitions, IpcMainHandler, IpcMainListener, IpcRefValue, Refs, RendererCommands } from '@commas/electron-ipc'
import { ipcMain } from '@commas/electron-ipc'
import { provideIPC } from '../../main/utils/compositions'
import { invokeRenderer } from '../../main/utils/ipc'
import type { MainAPIContext } from '../types'

function on<
  K extends keyof EventDefinitions,
>(this: MainAPIContext, channel: K, listener: IpcMainListener<EventDefinitions[K]>) {
  ipcMain.on(channel, listener)
  this.$.app.onInvalidate(() => {
    ipcMain.removeListener(channel, listener)
  })
}

function handle<
  K extends keyof CommandDefinitions,
>(this: MainAPIContext, channel: K, listener: IpcMainHandler<CommandDefinitions[K]>) {
  ipcMain.handle(channel, listener)
  this.$.app.onInvalidate(() => {
    ipcMain.removeHandler(channel)
  })
}

function provide<
  T extends IpcRefValue<Refs[K]>,
  K extends keyof Refs = keyof Refs,
>(this: MainAPIContext, key: K, valueRef: Ref<T>) {
  const cleanup = provideIPC(key, valueRef)
  this.$.app.onInvalidate(() => {
    cleanup()
  })
}

function invoke<
  K extends keyof RendererCommands,
>(this: MainAPIContext, sender: WebContents, channel: K, ...args: Parameters<RendererCommands[K]>) {
  const { promise, dispose } = invokeRenderer<K>(sender, channel, ...args)
  this.$.app.onInvalidate(dispose)
  return promise
}

export * from '../shim'

export {
  on,
  handle,
  provide,
  invoke,
}
