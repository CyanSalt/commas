import * as commas from 'commas:api/renderer'
import { ipcRenderer } from 'electron'

export default () => {

  const terminal = $(commas.workspace.useCurrentTerminal())
  const settings = commas.remote.useSettings()

  commas.ipcRenderer.handle('ai-quick-fix', (event, command: string) => {
    if (!terminal) return
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    terminal.addons?.shellIntegration?.addQuickFixAction(command)
  })

  commas.app.on('terminal.command-complete', async (command, output) => {
    if (
      settings['ai.shell.doctor']
      && command.command
      && command.exitCode
      && !command.actions?.length
    ) {
      const recommendation = await ipcRenderer.invoke('ai-doctor', command.command, output)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (recommendation && terminal?.addons?.shellIntegration) {
        terminal.addons.shellIntegration.addQuickFixAction(recommendation, command)
      }
    }
  })

}
