import type EventEmitter from 'node:events'
import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import ipc from '@achrinza/node-ipc'
import * as cfonts from 'cfonts'
import * as commas from 'commas:api/main'
import { app, BrowserWindow, webContents } from 'electron'
import { random, sortBy } from 'lodash'
import picocolors from 'picocolors'
import { quote } from 'shell-quote'
import table from 'text-table'
import type { CommandModule } from './command'
import { executeCommand, getCommandModule, useExternalURLCommands } from './command'

declare module '@commas/types/settings' {
  export interface Settings {
    'cli.command.externalURLs'?: { command: string, url: string }[],
    'cli.command.aliases'?: Record<string, string>,
  }
}

declare module '@commas/api/modules/context' {
  export interface Context {
    'cli.command': CommandModule,
  }
}

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
        let payload: string | undefined
        let done: boolean | undefined
        while (!done) {
          const result = await execution.next(payload)
          payload = undefined
          done = result.done
          const stdout = result.value
          if (stdout) {
            if (stdout.endsWith('\x05')) {
              ipc.server.emit(socket, 'pause', stdout.slice(0, -1))
              const [received] = await commas.shell.until(ipc.server as unknown as EventEmitter<{ resume: [string] }>, 'resume')
              payload = received
            } else {
              ipc.server.emit(socket, 'data', stdout)
            }
          }
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
    args: {
      name: 'command',
      isOptional: true,
    },
    usage: '[command]#!cli.usage.help',
    handler({ argv }) {
      const colors = ['red', 'green', 'yellow', 'blue', 'magenta', 'cyan']
      const ansiArt = 'commas'.split('').map((character, index) => {
        return cfonts.render(character, {
          font: 'tiny',
          colors: [colors[index % colors.length]],
          space: false, // docs on npmjs.com
          spaceless: true, // actually (cli argument)
        })['array'] as string[]
      }).reduce((lines, array) => {
        return array.map((line, index) => String(lines[index] ?? '') + line)
      }, []).join(os.EOL)

      const helpingCommand = argv[0]
      const manual = helpingCommand ? getCommandModule(helpingCommand, commands) : undefined
      if (manual) {
        return `
${manual.description ? commas.i18n.translate(manual.description) + '\n\n' : ''}${picocolors.bold(commas.i18n.translate('Usage:#!cli.1'))}
    commas ${helpingCommand}${manual.usage ? ' ' + picocolors.italic(commas.i18n.translate(manual.usage)) : ''}
`
      }

      const message = `
${ansiArt}

${app.name} ${app.getVersion()}
${manifest.description}

${picocolors.bold(commas.i18n.translate('Usage:#!cli.1'))}
    commas ${picocolors.italic(commas.i18n.translate('<command> [...options]#!cli.3'))}

${picocolors.bold(commas.i18n.translate('Commands:#!cli.2'))}
${indent(table(sortBy(commandList, entry => entry[0])), '    ')}
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
    args: {
      name: 'module-name',
      isOptional: true,
    },
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
    command: 'user',
    description: 'Print user data path#!cli.description.user',
    handler() {
      return commas.file.userFile()
    },
  })

  commas.context.provide('cli.command', {
    command: 'run',
    description: 'Run a command with arguments in a new tab#!cli.description.run',
    args: {
      name: 'command-with-args',
      isVariadic: true,
    },
    usage: '<...command-with-args>#!cli.usage.run',
    handler({ sender, argv }) {
      commas.frame.send(sender, 'open-tab', undefined, {
        command: quote(argv),
      })
    },
  })

  commas.context.provide('cli.command', {
    command: 'open',
    description: 'Open built-in tab#!cli.description.open',
    args: {
      name: 'name',
    },
    usage: '<name>#!cli.usage.open',
    handler({ sender, argv }) {
      commas.frame.send(sender, 'open-pane', argv[0])
    },
  })

  commas.context.provide('cli.command', {
    command: 'select',
    description: 'Jump to the nth tab#!cli.description.select',
    args: {
      name: 'nth-tab',
    },
    usage: '<nth-tab>#!cli.usage.select',
    handler({ sender, argv }) {
      const index = Number(argv[0])
      if (Number.isInteger(index)) {
        commas.frame.send(sender, 'select-tab', index)
      } else {
        const error = new Error('Invalid argument')
        error['stderr'] = ''
        throw error
      }
    },
  })

  commas.context.provide('cli.command', {
    command: 'roll',
    description: 'Generate random numbers from 1 to 100#!cli.description.roll',
    args: {
      name: 'n-times',
      isOptional: true,
    },
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
    args: {
      name: 'file',
      isOptional: true,
      generators: {
        template: 'filepaths',
      },
    },
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
    command: 'imgcat',
    description: 'Display a image in terminal#!cli.description.imgcat',
    args: {
      name: 'file',
      generators: {
        template: 'filepaths',
      },
    },
    usage: '<file>#!cli.usage.imgcat',
    async handler({ argv, cwd }) {
      if (!argv.length) return
      const relativePath = argv[0]
      const file = path.resolve(cwd, relativePath)
      const image = await fs.promises.readFile(file)
      return `\u001b]1337;File=inline=1;size=${image.length};name=${relativePath}:${image.toString('base64')}`
    },
  })

  commas.context.provide('cli.command', {
    command: 'free',
    description: 'Terminate all processes on a port#!cli.description.free',
    args: {
      name: 'port',
    },
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

  commas.context.provide('cli.command', {
    command: 'history',
    description: 'Get history in current session#!cli.description.history',
    args: {
      name: 'num',
      isOptional: true,
    },
    usage: '[n-steps]#!cli.usage.history',
    async handler({ sender, argv }) {
      const index = Number(argv[0])
      const recentCommands = await commas.ipcMain.invoke(sender, 'get-history', Number.isInteger(index) ? index : undefined)
      return recentCommands.join('\r\n')
    },
  })

  const externalURLCommands = $(useExternalURLCommands())
  commas.app.effect(() => {
    commas.context.provide('cli.command', ...externalURLCommands)
  })

  commas.app.effect(() => {
    commas.context.provide('terminal.completion-command', {
      name: 'commas',
      subcommands: commands.map<Fig.Subcommand>(item => ({
        name: item.command,
        description: item.description ? commas.i18n.translate(item.description) : undefined,
        args: item.args,
      })),
    })
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
