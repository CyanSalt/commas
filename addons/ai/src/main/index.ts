import * as commas from 'commas:api/main'
import { getAccessToken } from './chat'
import { getCommand, getDoctorCommand } from './prompt'
import { access, startServer, stopServer } from './server'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'ai-doctor': (command: string, output: string) => string,
    'toggle-ai-server': (value: boolean) => void,
  }
  export interface Refs {
    'ai-server-status': boolean,
  }
}

export default () => {

  let status = $customRef<boolean>((track, trigger) => {
    let started = false
    return {
      get: () => {
        track()
        return started
      },
      set: async value => {
        if (started === value) return
        if (value) {
          await startServer()
        } else {
          await stopServer()
        }
        started = value
        trigger()
      },
    }
  })

  commas.ipcMain.provide('ai-server-status', $$(status))

  commas.app.onCleanup(() => {
    stopServer()
  })

  commas.context.provide('cli.command', {
    command: 'ai',
    description: 'Get command with AI prompt#!cli.description.ai',
    async *handler({ sender }) {
      const query = yield '? \x05'
      if (query) {
        // Ensure server
        await startServer()
        status = true
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

  commas.ipcMain.handle('toggle-ai-server', async (event, value) => {
    if (value) {
      await startServer()
      status = true
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
