import { ipcRenderer } from 'electron'
import type { CommasContext } from '../types'
import type { IpcRendererEvent } from 'electron'

function on(this: CommasContext, channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on(channel, listener)
  this.$.app.onCleanup(() => {
    ipcRenderer.removeListener(channel, listener)
  })
}

export {
  on,
}
