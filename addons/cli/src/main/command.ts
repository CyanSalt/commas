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
  usage?: string,
  handler: (context: CommandContext, event: IpcMainInvokeEvent) => any,
}

function getCommandModule(command: string, commands: CommandModule[]) {
  const settings = commas.settings.useSettings()
  const aliases = settings['cli.command.aliases'] ?? {}
  while (aliases[command]) {
    command = aliases[command].trim()
  }
  return commands.find(item => item.command === command)
}

async function executeCommand(
  event: IpcMainInvokeEvent,
  inputContext: CommandContext,
  commands: CommandModule[],
) {
  const [subcommand, ...argv] = inputContext.argv
  const mod = getCommandModule(subcommand, commands)
  if (!mod) {
    return executeCommand(event, { ...inputContext, argv: ['help'] }, commands)
  }
  const context = { ...inputContext, argv }
  const stdout = await mod.handler(context, event)
  return typeof stdout === 'string' ? stdout : undefined
}

const externalURLCommandsRef = computed(() => {
  const settings = commas.settings.useSettings()
  const entries = settings['cli.command.externalURLs']
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
  getCommandModule,
  executeCommand,
  useExternalURLCommands,
}
