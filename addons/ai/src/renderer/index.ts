import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import AIAnchor from './AIAnchor.vue'
import { useAIStatus } from './compositions'

declare module '@commas/electron-ipc' {
  export interface RendererCommands {
    'ai-chat-fix': (command: string) => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  const terminal = $(commas.workspace.useCurrentTerminal())

  commas.ipcRenderer.handle('ai-chat-fix', (event, command) => {
    if (!terminal) return
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    terminal.addons?.shellIntegration?.addQuickFixAction(undefined, { command })
  })

  const status = $(useAIStatus())

  const generateID = commas.helper.createIDGenerator()

  commas.app.on('terminal.command-complete', async (command, output) => {
    if (
      status
      && command.command
      && command.exitCode
      && commas.workspace.isErrorExitCode(command.exitCode)
      && !command.actions?.length
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      const shellIntegration = terminal?.addons?.shellIntegration
      if (shellIntegration) {
        const id = `ai.fix@${generateID()}`
        shellIntegration.addQuickFixAction(command, { loading: id })
        const recommendation = await ipcRenderer.invoke('ai-fix', command.command, output)
        shellIntegration.resolveLoadingCompletion(id, recommendation)
      }
    }
  })

  commas.context.provide('terminal.ui-left-action-anchor', AIAnchor)

}
