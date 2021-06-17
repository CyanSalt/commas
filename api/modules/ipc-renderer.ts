import { ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'
import type { CommasContext } from '../types'

function on(this: CommasContext, channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on(channel, listener)
  this.$.app.onCleanup(() => {
    ipcRenderer.removeListener(channel, listener)
  })
}

export {
  on,
}
