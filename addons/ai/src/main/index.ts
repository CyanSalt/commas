import * as commas from 'commas:api/main'
import { useAIStatus } from './chat'
import type { CommandSuggestion, RuntimeInformation } from './prompt'
import { AnswerSyntaxError, completeCommand, fixCommand, translateCommand } from './prompt'

declare module '@commas/types/settings' {
  export interface Settings {
    'ai.provider.baseURL'?: string,
    'ai.provider.apiKey'?: string,
    'ai.provider.modelID'?: string,
  }
}

declare module '@commas/electron-ipc' {
  export interface Commands {
    'ai-fix': (command: string, output: string, runtime: RuntimeInformation) => string,
    'ai-completion': (input: string, runtime: RuntimeInformation) => string,
    'toggle-ai': (value: boolean) => void,
  }
  export interface Refs {
    'ai-status': boolean,
  }
}

export default () => {

  let status = $(useAIStatus())

  commas.ipcMain.provide('ai-status', $$(status))

  commas.context.provide('cli.command', {
    command: 'ai',
    description: 'Get command with AI prompt#!cli.description.ai',
    async *handler({ argv, sender, cwd }) {
      let query: string
      if (argv.length) {
        query = argv.join(' ')
      } else {
        query = yield '? \x05'
      }
      if (query) {
        status = true
        let suggestion: CommandSuggestion
        try {
          suggestion = await translateCommand(query, { cwd })
        } catch (err) {
          if (err instanceof AnswerSyntaxError) {
            return `# ${err.message}`
          }
          throw err
        }
        await commas.ipcMain.invoke(sender, 'ai-chat-fix', suggestion.value)
        return `> ${suggestion.label ?? suggestion.value}`
      }
    },
  })

  let id = 1n

  commas.context.provide('terminal.completion-provider', async params => {
    return [
      {
        label: commas.i18n.translate('<Autocomplete with AI>#!ai.1'),
        value: '',
        query: params.input,
        type: 'third-party',
        state: 'pending',
        key: `ai-completion@${id}`,
      },
    ]
  })

  commas.ipcMain.handle('ai-fix', async (event, command, output, runtime) => {
    try {
      const suggestion = await fixCommand(command, output, runtime)
      return suggestion.value
    } catch {
      return ''
    }
  })

  commas.ipcMain.handle('ai-completion', async (event, input, runtime) => {
    id += 1n
    try {
      const suggestion = await completeCommand(input, runtime)
      return suggestion.value
    } catch {
      return ''
    }
  })

  commas.ipcMain.handle('toggle-ai', async (event, value) => {
    status = value
  })

  commas.i18n.addTranslationDirectory('locales')

  commas.settings.addSettingsSpecsFile('settings.spec.json')

}
