import * as util from 'util'
import { shell } from 'electron'
import yargsParser from 'yargs-parser'
import { getSettings } from '../../lib/settings'

export interface CommandModule {
  command: string | string[],
  raw?: boolean,
  handler: (argv: string | Record<string, any>) => any,
}

export async function executeCommand(line: string, commands: CommandModule[]) {
  const [command] = line.split(/\s+/, 1)
  const controller = commands.find(item => {
    return Array.isArray(item.command)
      ? item.command.includes(command)
      : item.command === command
  })
  try {
    if (controller) {
      const argv = line.slice(command.length).trim()
      const stdout = await controller.handler(
        controller.raw ? argv : yargsParser(argv.split(/\s+/))
      )
      return { code: 0, stdout: String(stdout) }
    } else {
      throw new Error(`command not found: ${command}`)
    }
  } catch (err) {
    return { code: 1, stderr: String(err) }
  }
}

export async function getExternalURLCommands(): Promise<CommandModule[]> {
  const settings = await getSettings()
  const entries: ({ command: string | string[], url: string })[] = settings['shell.command.externalURLs']
  return entries.map(entry => {
    const { url, command } = entry
    return {
      command,
      raw: true,
      handler(argv: string) {
        const finalURL = util.format(url, encodeURIComponent(argv))
        shell.openExternal(finalURL)
        return finalURL
      },
    }
  })
}
