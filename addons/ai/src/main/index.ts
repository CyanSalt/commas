import * as commas from 'commas:api/main'
import { getAccessToken, useAIStatus } from './chat'
import { getCommand, getDoctorCommand } from './prompt'
import { access, stopServer } from './server'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'ai-doctor': (command: string, output: string) => string,
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
    async *handler({ sender }) {
      const query = yield '? \x05'
      if (query) {
        const command = await getCommand(query)
        await commas.ipcMain.invoke(sender, 'ai-quick-fix', command)
        return `> ${command}`
      }
    },
  })

  commas.ipcMain.handle('ai-doctor', async (event, command, output) => {
    try {
      return await getDoctorCommand(command, output)
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
