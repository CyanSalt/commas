import * as util from 'util'
import { computed } from '@vue/reactivity'
import * as commas from 'commas:api/main'
import { shell } from 'electron'
import type { IpcMainInvokeEvent } from 'electron'

export interface CommandContext {
  argv: string[],
  cwd: string,
  stdin?: string,
}

export interface CommandModule {
  command: string,
  handler: (context: CommandContext, event: IpcMainInvokeEvent) => any,
}

async function executeCommand(
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
  const settings = commas.settings.useSettings()
  const entries: ({ command: string, url: string })[] | undefined = settings['cli.command.externalURLs']
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

function useExternalURLCommands() {
  return externalURLCommandsRef
}

export {
  executeCommand,
  useExternalURLCommands,
}
