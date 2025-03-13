import * as util from 'node:util'
import * as commas from 'commas:api/main'
import type { WebContents } from 'electron'
import { shell } from 'electron'
import type { Generable } from '../../../../src/shared/helper'

export interface CommandContext {
  sender: WebContents,
  command: string,
  ppid: number,
  argv: string[],
  cwd: string,
  stdin?: string,
}

export interface CommandModule {
  command: string,
  description?: string,
  usage?: string,
  args?: Fig.Subcommand['args'],
  handler: (context: CommandContext) => Generable<string, string | void, string | void>,
}

function getCommandModule(command: string, commands: CommandModule[]) {
  const settings = commas.settings.useSettings()
  const aliases = settings['cli.command.aliases'] ?? {}
  while (aliases[command]) {
    command = aliases[command].trim()
  }
  return commands.find(item => item.command === command)
}

function executeCommand(
  inputContext: CommandContext,
  commands: CommandModule[],
): AsyncGenerator<string, string | void, string | void> {
  const [command, ...argv] = inputContext.argv
  const mod = getCommandModule(command, commands)
  if (!mod) {
    return executeCommand({ ...inputContext, argv: ['help', command] }, commands)
  }
  const context = { ...inputContext, command, argv }
  return commas.helper.iterate(mod.handler(context))
}

const externalURLCommands = $computed(() => {
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
  return $$(externalURLCommands)
}

export {
  getCommandModule,
  executeCommand,
  useExternalURLCommands,
}
