import type { IpcMainEvent, WebContents } from 'electron'
import type { RendererCommands } from '@commas/electron-ipc'
import { ipcMain } from '@commas/electron-ipc'

export function invokeRenderer<K extends keyof RendererCommands>(
  sender: WebContents,
  channel: K,
  ...args: Parameters<RendererCommands[K]>
) {
  sender.send(`invoke:${channel}`, ...args)
  let dispose: () => void
  const promise = new Promise<Awaited<ReturnType<RendererCommands[K]>>>(resolve => {
    const handler = (event: IpcMainEvent, value: ReturnType<RendererCommands[K]>) => {
      if (event.sender === sender) {
        resolve(value as Awaited<ReturnType<RendererCommands[K]>>)
        // @ts-expect-error inference limitation
        ipcMain.removeListener(`return:${channel}`, handler)
      }
    }
    // @ts-expect-error inference limitation
    ipcMain.on(`return:${channel}`, handler)
    dispose = () => {
      // @ts-expect-error inference limitation
      ipcMain.removeListener(`return:${channel}`, handler)
    }
  })
  return {
    promise,
    dispose: dispose!,
  }
}
