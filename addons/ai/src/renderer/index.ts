import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import type { CommandSuggestion } from '../types/prompt'
import AIAnchor from './AIAnchor.vue'
import { useAIStatus } from './composables'

declare module '@commas/electron-ipc' {
  export interface RendererCommands {
    'ai-chat-fix': (suggestions: CommandSuggestion[]) => void,
  }
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  const terminal = $(commas.workspace.useCurrentTerminal())

  commas.ipcRenderer.handle('ai-chat-fix', (event, suggestions) => {
    if (!terminal) return
    for (const suggestion of suggestions) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      terminal.addons?.shellIntegration?.addQuickFixAction(undefined, {
        value: suggestion.value,
        label: suggestion.label,
        description: suggestion.description,
      })
    }
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
        const key = `ai.fix@${generateID()}`
        shellIntegration.addQuickFixAction(command, { state: 'loading', key })
        const recommendation = await ipcRenderer.invoke('ai-fix', command.command, output, { cwd: terminal.cwd })
        shellIntegration.resolveLoadingCompletion(key, recommendation)
      }
    }
  })

  commas.context.provide('terminal.completion-loader', (completion, shellIntegration) => {
    const key = completion.key
    if (key?.startsWith('ai-completion@')) {
      ipcRenderer.invoke('ai-completion', completion.query, { cwd: shellIntegration.tab.cwd }).then(command => {
        shellIntegration.resolveLoadingCompletion(key, command)
      })
      return true
    }
    return false
  })

  commas.context.provide('terminal.ui-left-action-anchor', AIAnchor)

}
