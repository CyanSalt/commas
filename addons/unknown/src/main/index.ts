import * as commas from 'commas:api/main'
import { BrowserWindow } from 'electron'

export default () => {

  commas.i18n.addTranslationDirectory('locales')

  commas.context.provide('cli', {
    command: ',',
    handler() {
      const frame = BrowserWindow.getFocusedWindow()
      if (!frame) return
      frame.webContents.send('unknown-start')
    },
  })

}
