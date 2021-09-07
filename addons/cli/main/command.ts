import * as util from 'util'
import { computed, unref } from '@vue/reactivity'
import { shell } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'
import { useSettings } from '../../../main/lib/settings'

export interface CommandContext {
  argv: string[],
  cwd: string,
  stdin?: string,
}

export interface CommandModule {
  command: string,
  handler: (context: CommandContext, event: IpcMainInvokeEvent) => any,
}

export async function executeCommand(
  event: IpcMainInvokeEvent,
  inputContext: CommandContext,
  commands: CommandModule[],
  aliases: Record<string, string>,
) {
  const [subcommand, ...argv] = inputContext.argv
  let command = subcommand
  while (aliases[command]) {
    command = aliases[command].trim()
  }
  const controller = commands.find(item => item.command === command)
  if (!controller) {
    return executeCommand(event, { ...inputContext, argv: ['help'] }, commands, {})
  }
  const context = { ...inputContext, argv }
  const stdout = await controller.handler(context, event)
  return typeof stdout === 'string' ? stdout : undefined
}

const externalURLCommandsRef = computed(() => {
  const settings = unref(useSettings())
  const entries: ({ command: string, url: string })[] | undefined = settings['shell.command.externalURLs']
  return entries ? entries.map<CommandModule>(entry => {
    const { url, command } = entry
    return {
      command,
      handler({ argv }) {
        const finalURL = util.format(url, encodeURIComponent(argv.join(' ')))
        shell.openExternal(finalURL)
        return finalURL
      },
    }
  }) : []
})

export function useExternalURLCommands() {
  return externalURLCommandsRef
}
