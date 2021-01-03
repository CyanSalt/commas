import type { IpcRendererEvent } from 'electron'
import { ipcRenderer } from 'electron'

function on(channel: string, listener: (event: IpcRendererEvent, ...args: any[]) => void) {
  ipcRenderer.on(channel, listener)
  this.$.app.onCleanup(() => {
    ipcRenderer.removeListener(channel, listener)
  })
}

export {
  on,
}
