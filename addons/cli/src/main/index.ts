import * as path from 'path'
import * as util from 'util'
import * as vm from 'vm'
import { computed, effect, stop, unref } from '@vue/reactivity'
import chalk from 'chalk'
import * as commas from 'commas:api/main'
import { app, BrowserWindow, webContents } from 'electron'
import { random } from 'lodash'
import ipc from 'node-ipc'
import { quote } from 'shell-quote'
import type { CommandModule } from './command'
import { getCommandModule, executeCommand, useExternalURLCommands } from './command'

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

  ipc.config.id = 'commas-ipc-server'
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
          if (typeof stdout === 'string') {
            ipc.server.emit(socket, 'data', stdout)
          }
          done = result.done
        }
        ipc.server.emit(socket, 'end', 0)
      } catch (err) {
        ipc.server.emit(socket, 'error', util.inspect(err, {
          colors: true,
        }))
        ipc.server.emit(socket, 'end', 1)
      }
    })
  })
  ipc.server.start()
  commas.app.onCleanup(() => {
    ipc.server.stop()
  })

  /** {@link https://github.com/npm/cli/blob/latest/lib/utils/npm-usage.js#L39-L55} */
  const wrap = (arr) => {
    const out = ['']
    const line = process.stdout.columns
      ? Math.min(60, Math.max(process.stdout.columns - 16, 24))
      : 60
    let l = 0
    for (const c of arr.sort((a, b) => (a < b ? -1 : 1))) {
      if (out[l].length + c.length + 2 < line) {
        out[l] += ', ' + c
      } else {
        out[l++] += ','
        out[l] = c
      }
    }
    return out.join('\n    ').slice(2)
  }

  const commandListRef = computed(() => {
    const aliases = settings['cli.command.aliases'] ?? {}
    return [
      ...commands.map(item => item.command),
      ...Object.keys(aliases),
    ]
  })

  commas.context.provide('cli.command', {
    command: 'help',
    usage: '[command]',
    handler({ argv }) {
      /** {@link https://patorjk.com/software/taag/#p=display&f=ANSI%20Shadow&t=COMMAS} */
      const ansi = `
 ██████╗! ██████╗ !███╗   ███╗!███╗   ███╗! █████╗ !███████╗
██╔════╝!██╔═══██╗!████╗ ████║!████╗ ████║!██╔══██╗!██╔════╝
██║     !██║   ██║!██╔████╔██║!██╔████╔██║!███████║!███████╗
██║     !██║   ██║!██║╚██╔╝██║!██║╚██╔╝██║!██╔══██║!╚════██║
╚██████╗!╚██████╔╝!██║ ╚═╝ ██║!██║ ╚═╝ ██║!██║  ██║!███████║
 ╚═════╝! ╚═════╝ !╚═╝     ╚═╝!╚═╝     ╚═╝!╚═╝  ╚═╝!╚══════╝
`
        .split('\n')
        .map(line => {
          const cols = line.split('!')
          if (cols.length < 2) return line
          const colors = [
            chalk.red,
            chalk.green,
            chalk.yellow,
            chalk.blue,
            chalk.magenta,
            chalk.cyan,
          ]
          return cols.map((col, index) => colors[index % colors.length](col)).join('')
        })
        .join('\n')

      const helpingCommand = argv[0]
      const manual = helpingCommand ? getCommandModule(argv[0], commands) : undefined
      if (manual) {
        return `${ansi}
Usage: commas ${helpingCommand}${manual.usage ? ' ' + manual.usage : ''}
`
      }

      return `${ansi}
Usage: commas <command>

where <command> is one of:
    ${wrap(unref(commandListRef))}
`
    },
  })

  commas.context.provide('cli.command', {
    command: 'version',
    handler() {
      return app.getVersion()
    },
  })

  commas.context.provide('cli.command', {
    command: 'run',
    usage: '<...command-with-args>',
    handler({ sender, argv }) {
      sender.send('open-tab', {
        command: quote(argv),
      })
    },
  })

  commas.context.provide('cli.command', {
    command: 'edit',
    usage: '<file>',
    handler({ sender, argv, cwd }) {
      sender.send('open-code-editor', path.join(cwd, argv[0]))
    },
  })

  commas.context.provide('cli.command', {
    command: 'select',
    usage: '<nth-tab>',
    handler({ sender, argv }) {
      const index = Number.parseInt(argv[0], 10)
      if (!Number.isNaN(index)) {
        sender.send('select-tab', index)
      }
    },
  })

  let context

  commas.context.provide('cli.command', {
    command: 'eval',
    handler({ argv }) {
      const script = argv[0]
      if (script === 'reset') {
        context = undefined
        return ''
      }
      if (!context) {
        context = Object.create(null)
        vm.createContext(context)
      }
      return util.inspect(vm.runInContext(script, context), {
        showHidden: true,
        showProxy: true,
        colors: true,
      })
    },
  })

  commas.context.provide('cli.command', {
    command: 'roll',
    usage: '[n-times]',
    handler({ argv }) {
      let length = Number.parseInt(argv[0], 10)
      if (Number.isNaN(length)) {
        length = 1
      }
      return Array.from({ length })
        .map(() => random(1, 100)).join('\n')
    },
  })

  commas.context.provide('cli.command', {
    command: 'preview',
    usage: '[file]',
    handler({ sender, argv, cwd }) {
      const frame = BrowserWindow.fromWebContents(sender)
      if (!frame) return
      const file = argv[0] ? path.resolve(cwd, argv[0]) : cwd
      frame.previewFile(file, argv[0] || file)
    },
  })

  commas.context.provide('cli.command', {
    command: 'trick',
    handler({ sender }) {
      const frame = BrowserWindow.fromWebContents(sender)
      if (!frame) return
      const [width, height] = frame.getSize()
      frame.setSize(width - 1, height - 1)
      frame.setSize(width, height)
    },
  })

  const externalURLCommandsRef = useExternalURLCommands()
  let loadedExternalURLCommands: CommandModule[] = []
  const reactiveEffect = effect(() => {
    const externalURLCommands = unref(externalURLCommandsRef)
    commas.context.cancelProviding('cli.command', ...loadedExternalURLCommands)
    commas.context.provide('cli.command', ...externalURLCommands)
    loadedExternalURLCommands = externalURLCommands
  })
  commas.app.onCleanup(() => {
    stop(reactiveEffect)
  })

  commas.settings.addSettingsSpecsFile('settings.spec.json')

  commas.i18n.addTranslationDirectory('locales')

}
