import * as commas from 'commas:api/renderer'
import { ipcRenderer } from 'electron'
import type { TerminalTabAddons } from '../../../../src/typings/terminal'

export default () => {

  const terminal = $(commas.workspace.useCurrentTerminal())

  type IntegratedShellCommand = NonNullable<NonNullable<TerminalTabAddons['shellIntegration']>['currentCommand']>

  commas.app.events.on('command-complete', async (command: IntegratedShellCommand, output: string) => {
    if (command.command && command.exitCode && !command.actions?.length) {
      const recommendation = await ipcRenderer.invoke('ai-doctor', command.command, output)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (recommendation && terminal?.addons?.shellIntegration) {
        terminal.addons.shellIntegration.addQuickFixAction(recommendation, command)
      }
    }
  })

}
