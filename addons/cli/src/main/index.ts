import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as util from 'node:util'
import * as vm from 'node:vm'
import ipc from '@achrinza/node-ipc'
import * as cfonts from 'cfonts'
import chalk from 'chalk'
import * as commas from 'commas:api/main'
import { app, BrowserWindow, webContents } from 'electron'
import { random, sortBy } from 'lodash'
import { quote } from 'shell-quote'
import table from 'text-table'
import type { CommandModule } from './command'
import { executeCommand, getCommandModule, useExternalURLCommands } from './command'

declare module '../../../../src/typings/settings' {
  export interface Settings {
    'cli.command.externalURLs'?: { command: string, url: string }[],
    'cli.command.aliases'?: Record<string, string>,
  }
}

declare module '../../../../api/modules/context' {
  export interface Context {
    'cli.command': CommandModule,
  }
}

chalk.level = 3

export default () => {

  const settings = commas.settings.useSettings()

  const commands = commas.context.getCollection('cli.command')

  function cleanStack(stack: string) {
    return stack.replace(/\n\s+at\s+(.+?)(?:(?:\((.+):\d+:\d+\))|:\d+:\d+)\s*$/gm, (line, frame, file) => {
      const source = file ?? frame
      return source.includes('node:') || source.startsWith(commas.app.getPath()) ? '' : line
    })
  }

  ipc.config.appspace = 'ipc.commas.'
  ipc.config.id = String(process.pid)
  ipc.config.silent = true
  ipc.serve(() => {
    ipc.server.on('request', async (context, socket) => {
      context.sender = webContents.fromId(context.sender)
      try {
        const execution = executeCommand(context, commands)
        let done: boolean | undefined
        while (!done) {
          const result = await execution.next()
          const stdout = result.value
          if (stdout) {
            ipc.server.emit(socket, 'data', stdout)
          }
          done = result.done
        }
        ipc.server.emit(socket, 'end', 0)
      } catch (err) {
        const stderr = err.stderr ?? (err.stack ? cleanStack(err.stack) : String(err))
        if (stderr) {
          ipc.server.emit(socket, 'error', stderr)
        }
        ipc.server.emit(socket, 'end', 1)
      }
    })
  })
  ipc.server.start()
  commas.app.onCleanup(() => {
    ipc.server.stop()
  })

  const indent = (text: string, space: string) => {
    return text.split('\n').map(line => space + line).join(os.EOL)
  }

  const commandList = $computed(() => {
    const aliases = settings['cli.command.aliases'] ?? {}
    return [
      ...commands.map(item => [item.command, commas.i18n.translate(item.description ?? '')]),
      ...Object.entries(aliases),
    ]
  })

  const manifest = $computed(() => commas.i18n.getI18nManifest(commas.app.getManifest()))

  commas.context.provide('cli.command', {
    command: 'help',
    description: 'Print help information#!cli.description.help',
    usage: '[command]#!cli.usage.help',
    handler({ argv }) {
      const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']
      const ansiArt = 'commas'.split('').map((character, index) => {
        return cfonts.render(character, {
          font: 'tiny',
          colors: [colors[index % colors.length]],
          space: false,
        })['array'] as string[]
      }).reduce((lines, array) => {
        return array.map((line, index) => String(lines[index] ?? '') + line)
      }, []).join(os.EOL)

      const helpingCommand = argv[0]
      const manual = helpingCommand ? getCommandModule(helpingCommand, commands) : undefined
      if (manual) {
        return `
${manual.description ? commas.i18n.translate(manual.description) + '\n\n' : ''}${chalk.bold(commas.i18n.translate('Usage:#!cli.1'))}
    commas ${helpingCommand}${manual.usage ? ' ' + chalk.italic(commas.i18n.translate(manual.usage)) : ''}
`
      }

      const message = `
${ansiArt}

${app.name} ${app.getVersion()}
${manifest.description}

${chalk.bold(commas.i18n.translate('Usage:#!cli.1'))}
    commas ${chalk.italic(commas.i18n.translate('<command> [...options]#!cli.3'))}

${chalk.bold(commas.i18n.translate('Commands:#!cli.2'))}
${indent(table(commandList), '    ')}
${
  helpingCommand
    ? '\n' + commas.i18n.translate('Unknown command: ${command}#!cli.4', {
      command: helpingCommand,
    }) + '\n'
    : ''
}`

      if (helpingCommand) {
        const error = new Error(message)
        error['stderr'] = message
        throw error
      } else {
        return message
      }
    },
  })

  commas.context.provide('cli.command', {
    command: 'version',
    description: 'Print version information#!cli.description.version',
    usage: '[module-name-or-all]#!cli.usage.version',
    handler({ argv }) {
      const versions = {
        commas: app.getVersion(),
        ...process.versions,
      }
      if (argv[0] === 'all') {
        return table(sortBy(
          Object.entries(versions).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
          entry => entry[0],
        ))
      } else if (typeof versions[argv[0]] === 'string') {
        return versions[argv[0]]
      } else {
        return versions.commas
      }
    },
  })

  commas.context.provide('cli.command', {
    command: 'run',
    description: 'Run a command with arguments in a new tab#!cli.description.run',
    usage: '<...command-with-args>#!cli.usage.run',
    handler({ sender, argv }) {
      sender.send('open-tab', undefined, {
        command: quote(argv),
      })
    },
  })

  commas.context.provide('cli.command', {
    command: 'select',
    description: 'Jump to the nth tab#!cli.description.select',
    usage: '<nth-tab>#!cli.usage.select',
    handler({ sender, argv }) {
      const index = Number(argv[0])
      if (Number.isInteger(index)) {
        sender.send('select-tab', index)
      } else {
        const error = new Error('Invalid argument')
        error['stderr'] = ''
        throw error
      }
    },
  })

  let context: vm.Context | undefined

  commas.context.provide('cli.command', {
    command: 'eval',
    description: 'Evaluate a JS expression#!cli.description.eval',
    handler({ argv }) {
      const script = argv[0]
      if (script === 'reset') {
        context = undefined
        return
      }
      if (!context) {
        context = Object.create(null)
        vm.createContext(context)
      }
      return util.inspect(vm.runInContext(script, context!), {
        showHidden: true,
        showProxy: true,
        colors: true,
      })
    },
  })

  commas.context.provide('cli.command', {
    command: 'roll',
    description: 'Generate random numbers from 1 to 100#!cli.description.roll',
    usage: '[n-times]#!cli.usage.roll',
    handler({ argv }) {
      let length = Number(argv[0])
      if (!Number.isInteger(length) || length <= 0) {
        length = 1
      }
      return Array.from({ length })
        .map(() => random(1, 100)).join(os.EOL)
    },
  })

  commas.context.provide('cli.command', {
    command: 'preview',
    description: 'Preview a file#!cli.description.preview',
    usage: '[file]#!cli.usage.preview',
    async handler({ sender, argv, cwd }) {
      const frame = BrowserWindow.fromWebContents(sender)
      if (!frame) return
      const file = argv[0] ? path.resolve(cwd, argv[0]) : cwd
      await fs.promises.access(file, fs.constants.R_OK)
      frame.previewFile(file, argv[0] || file)
    },
  })

  commas.context.provide('cli.command', {
    command: 'free',
    description: 'Terminate all processes on a port#!cli.description.free',
    usage: '<port>#!cli.usage.free',
    async handler({ argv }) {
      const port = Number(argv[0])
      if (Number.isInteger(port) && port > 0) {
        const { stdout } = await commas.shell.execute(
          process.platform === 'win32'
            ? `netstat -ano | findstr "${port}"`
            : `lsof -nP -iTCP -sTCP:LISTEN | grep ${port}`,
        )
        const pid = stdout.split('\n')[0]?.match(/\s+(\d+)\s+/)?.[1]
        if (pid) {
          try {
            process.kill(Number(pid))
          } catch {
            // ignore error
          }
        }
      } else {
        const error = new Error('Invalid argument')
        error['stderr'] = ''
        throw error
      }
    },
  })

  const externalURLCommands = $(useExternalURLCommands())
  commas.app.effect(() => {
    commas.context.provide('cli.command', ...externalURLCommands)
  })

  commas.context.provide('terminal.completion', async (query: string, command: string) => {
    if (command === 'commas') {
      return commands.map(item => ({
        type: 'command' as const,
        query,
        value: item.command,
        description: commas.i18n.translate(item.usage ?? '')
          + (item.description ? '\n\n' + commas.i18n.translate(item.description) : ''),
      }))
    }
    return []
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
