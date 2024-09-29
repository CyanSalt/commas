import * as commas from 'commas:api/main'
import type { NativeImage, Rectangle } from 'electron'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'capture-page': (rect: Rectangle) => NativeImage,
  }
}

export default () => {

  commas.ipcMain.handle('capture-page', async (event, rect) => {
    return event.sender.capturePage(rect)
  })

}
