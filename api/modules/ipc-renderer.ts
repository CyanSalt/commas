import type { IpcRendererEvent } from 'electron'
import { ipcRenderer } from 'electron'
import { injectIPC } from '../../src/renderer/utils/compositions'
import type { RendererAPIContext } from '../types'

function on(this: RendererAPIContext, channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on(channel, listener)
  this.$.app.onInvalidate(() => {
    ipcRenderer.removeListener(channel, listener)
  })
}

export * from '../shim'

export {
  on,
  injectIPC as inject,
}
