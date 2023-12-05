import type { IpcRendererEvent } from 'electron'
import { ipcRenderer } from 'electron'
import { injectIPC } from '../../src/renderer/utils/compositions'
import { handleRenderer } from '../../src/renderer/utils/ipc'
import type { RendererAPIContext } from '../types'

function on(this: RendererAPIContext, channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on(channel, listener)
  this.$.app.onInvalidate(() => {
    ipcRenderer.removeListener(channel, listener)
  })
}

function handle(
  this: RendererAPIContext,
  channel: string,
  listener: (event: IpcRendererEvent, ...args: any[]) => void,
) {
  const { dispose } = handleRenderer(channel, listener)
  this.$.app.onInvalidate(dispose)
}

export * from '../shim'

export {
  on,
  injectIPC as inject,
  handle,
}
