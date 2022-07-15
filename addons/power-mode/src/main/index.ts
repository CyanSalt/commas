import commas from 'commas:api/main'
import { BrowserWindow } from 'electron'

export default () => {

  commas.context.provide('cli', {
    command: 'power',
    usage: '[off]',
    async handler({ argv }) {
      const frame = BrowserWindow.getFocusedWindow()
      if (!frame) return
      const [status] = argv
      const enabled = status !== 'off'
      frame.webContents.send('toggle-power-mode', enabled)
      if (enabled) {
        return `
Power mode is turned on. Enter

    commas power off

to exit power mode.
`.trim()
      }
    },
  })

}
