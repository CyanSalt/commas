import * as commas from 'commas:api/main'
import { getAccessToken, useAIStatus } from './chat'
import { AnswerSyntaxError, fixCommand, translateCommand } from './prompt'
import { access, stopServer } from './server'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'ai-fix': (command: string, output: string) => string,
    'toggle-ai': (value: boolean) => void,
  }
  export interface Refs {
    'ai-status': boolean,
  }
}

export default () => {

  let status = $(useAIStatus())

  getAccessToken().catch(() => {
    // ignore error
  })

  commas.ipcMain.provide('ai-status', $$(status))

  commas.app.onCleanup(() => {
    stopServer()
  })

  commas.context.provide('cli.command', {
    command: 'ai',
    description: 'Get command with AI prompt#!cli.description.ai',
    async *handler({ argv, sender }) {
      let query: string
      if (argv.length) {
        query = argv.join(' ')
      } else {
        query = yield '? \x05'
      }
      if (query) {
        let command: string
        try {
          command = await translateCommand(query)
        } catch (err) {
          if (err instanceof AnswerSyntaxError) {
            return `# ${err.message}`
          }
          throw err
        }
        await commas.ipcMain.invoke(sender, 'ai-chat-fix', command)
        return `> ${command}`
      }
    },
  })

  commas.ipcMain.handle('ai-fix', async (event, command, output) => {
    try {
      return await fixCommand(command, output)
    } catch {
      return ''
    }
  })

  commas.ipcMain.handle('toggle-ai', async (event, value) => {
    if (value) {
      try {
        await access(() => getAccessToken())
      } catch {
        // ignore error
      }
    } else {
      status = false
    }
  })

  commas.i18n.addTranslationDirectory('locales')

}
