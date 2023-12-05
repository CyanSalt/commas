import type { IpcRendererEvent } from 'electron'
import { ipcRenderer } from 'electron'

export function handleRenderer<T>(
  channel: string,
  handler: (event: IpcRendererEvent, ...args: any[]) => T | Promise<T>,
) {
  const listener = async (event: IpcRendererEvent, ...args: any[]) => {
    const result = await handler(event, ...args)
    ipcRenderer.send(`return:${channel}`, result)
  }
  ipcRenderer.on(`invoke:${channel}`, listener)
  const dispose = () => {
    ipcRenderer.off(`invoke:${channel}`, listener)
  }
  return {
    dispose,
  }
}
