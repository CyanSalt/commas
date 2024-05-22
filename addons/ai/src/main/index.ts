import * as commas from 'commas:api/main'
import { getCommand } from './prompt'

export default () => {

  commas.context.provide('cli.command', {
    command: 'ai',
    description: 'Get command with AI prompt#!cli.description.ai',
    async *handler({ sender }) {
      const query = yield '? \x05'
      if (query) {
        const command = await getCommand(query)
        await commas.ipcMain.invoke(sender, 'add-quick-fix-action', command)
        return `> ${command}`
      }
    },
  })

  commas.i18n.addTranslationDirectory('locales')

}
