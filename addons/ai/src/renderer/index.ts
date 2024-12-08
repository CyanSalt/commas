import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import AIAnchor from './AIAnchor.vue'
import { useAIStatus } from './compositions'

declare module '@commas/electron-ipc' {
  export interface RendererCommands {
    'ai-quick-fix': (command: string) => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  const terminal = $(commas.workspace.useCurrentTerminal())

  commas.ipcRenderer.handle('ai-quick-fix', (event, command) => {
    if (!terminal) return
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    terminal.addons?.shellIntegration?.addQuickFixAction(command)
  })

  const status = $(useAIStatus())

  commas.app.on('terminal.command-complete', async (command, output) => {
    if (
      status
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

  commas.context.provide('terminal.ui-left-action-anchor', AIAnchor)

}
