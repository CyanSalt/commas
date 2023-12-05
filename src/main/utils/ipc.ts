import type { IpcMainEvent, WebContents } from 'electron'
import { ipcMain } from 'electron'

export function invokeRenderer<T>(
  sender: WebContents,
  channel: string,
  ...args: any[]
) {
  sender.send(`invoke:${channel}`, ...args)
  let dispose: () => void
  const promise = new Promise<T>(resolve => {
    const handler = (event: IpcMainEvent, values: T) => {
      if (event.sender === sender) {
        resolve(values)
        ipcMain.off(`return:${channel}`, handler)
      }
    }
    ipcMain.on(`return:${channel}`, handler)
    dispose = () => {
      ipcMain.off(`return:${channel}`, handler)
    }
  })
  return {
    promise,
    dispose: dispose!,
  }
}
