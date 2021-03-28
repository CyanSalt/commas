import * as util from 'util'
import { computed, unref } from '@vue/reactivity'
import { shell } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import yargsParser from 'yargs-parser'
import { useSettings } from '../../lib/settings'

export interface CommandModule {
  command: string,
  raw?: boolean,
  handler: (argv: string | Record<string, any>, event: IpcMainInvokeEvent) => any,
}

export function resolveCommandAliases(line: string, aliases: Record<string, string>) {
  const result = /\s+/.exec(line)
  if (!result) return line
  const command = line.slice(0, result.index)
  return aliases[command]
    ? resolveCommandAliases(aliases[command].trim() + ' ' + line.slice(result.index + result[0].length), aliases)
    : line
}

export async function executeCommand(event: IpcMainInvokeEvent, line: string, commands: CommandModule[]) {
  const [command] = line.split(/\s+/, 1)
  const controller = commands.find(item => item.command === command)
  try {
    if (!controller) {
      throw new Error(`command not found: ${command}`)
    }
    const argv = line.slice(command.length).trim()
    const stdout = await controller.handler(
      controller.raw ? argv : yargsParser(argv, {
        configuration: {
          'parse-numbers': false,
        },
      }),
      event
    )
    return { code: 0, stdout: String(stdout ?? '') }
  } catch (err) {
    return { code: 1, stderr: String(err) }
  }
}

const externalURLCommandsRef = computed<CommandModule[]>(() => {
  const settings = unref(useSettings())
  const entries: ({ command: string, url: string })[] | undefined = settings['shell.command.externalURLs']
  return entries ? entries.map(entry => {
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
  }) : []
})

export function useExternalURLCommands() {
  return externalURLCommandsRef
}
