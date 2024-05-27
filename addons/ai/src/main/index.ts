import * as commas from 'commas:api/main'
import { getCommand, getDoctorCommand } from './prompt'

declare module '../../../../src/typings/settings' {
  export interface Settings {
    'ai.ernie.key'?: string,
    'ai.ernie.secret'?: string,
    'ai.shell.doctor'?: boolean,
  }
}

function createSettingsError(key: string) {
  const message = commas.i18n.translate('Missing `${key}` in settings. You can open settings via Command+, key, or `commas open settings` command and add it.#!ai.1', { key })
  const error = new Error(message)
  error['stderr'] = message
  return error
}

export default () => {

  commas.context.provide('cli.command', {
    command: 'ai',
    description: 'Get command with AI prompt#!cli.description.ai',
    async *handler({ sender }) {
      const settings = commas.settings.useSettings()
      if (!settings['ai.ernie.key']) {
        throw createSettingsError('ai.ernie.key')
      }
      if (!settings['ai.ernie.secret']) {
        throw createSettingsError('ai.ernie.secret')
      }
      const query = yield '? \x05'
      if (query) {
        const command = await getCommand(query)
        await commas.ipcMain.invoke(sender, 'ai-quick-fix', command)
        return `> ${command}`
      }
    },
  })

  commas.ipcMain.handle('ai-doctor', async (event, command: string, output: string) => {
    try {
      const settings = commas.settings.useSettings()
      if (!settings['ai.ernie.key']) {
        throw createSettingsError('ai.ernie.key')
      }
      if (!settings['ai.ernie.secret']) {
        throw createSettingsError('ai.ernie.secret')
      }
      return await getDoctorCommand(command, output)
    } catch {
      return ''
    }
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
