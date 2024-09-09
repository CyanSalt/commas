import type { IpcRendererEvent } from 'electron'
import type { IpcRendererHandler, RendererCommands } from '@commas/electron-ipc'
import { ipcRenderer } from '@commas/electron-ipc'

export function handleRenderer<K extends keyof RendererCommands>(
  channel: K,
  handler: IpcRendererHandler<RendererCommands[K]>,
) {
  const listener = async (event: IpcRendererEvent, ...args: Parameters<RendererCommands[K]>) => {
    const result = await handler(event, ...args)
    // @ts-expect-error inference limitation
    ipcRenderer.send(`return:${channel}`, result)
  }
  // @ts-expect-error inference limitation
  ipcRenderer.on(`invoke:${channel}`, listener)
  const dispose = () => {
    // @ts-expect-error inference limitation
    ipcRenderer.off(`invoke:${channel}`, listener)
  }
  return {
    dispose,
  }
}
