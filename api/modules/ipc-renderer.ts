import { ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'
import { injectIPC } from '../../renderer/utils/compositions'
import type { RendererAPIContext } from '../types'

function on(this: RendererAPIContext, channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on(channel, listener)
  this.$.app.onCleanup(() => {
    ipcRenderer.removeListener(channel, listener)
  })
}

export * from '../shim'

export {
  on,
  injectIPC as inject,
}
