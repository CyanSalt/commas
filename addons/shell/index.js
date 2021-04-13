/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const childProcess = require('child_process')
    const path = require('path')
    const util = require('util')
    const { app } = require('electron')
    const random = require('lodash/random')
    const { effect, stop, unref } = require('@vue/reactivity')
    const { executeCommand, resolveCommandAliases, useExternalURLCommands } = commas.bundler.extract('shell/command.ts')

    commas.ipcMain.handle('get-shell-commands', async () => {
      const settings = await commas.settings.getSettings()
      const aliases = settings['shell.command.aliases']
      const commands = commas.context.getCollection('shell')
      return [...Object.keys(aliases), ...commands.map(item => item.command)]
    })

    commas.ipcMain.handle('execute-shell-command', async (event, line) => {
      const settings = await commas.settings.getSettings()
      const aliases = settings['shell.command.aliases']
      const commands = commas.context.getCollection('shell')
      return executeCommand(event, resolveCommandAliases(line, aliases), commands)
    })

    commas.context.provide('shell', {
      command: 'commas',
      handler() {
        return app.getVersion()
      },
    })

    const execa = util.promisify(childProcess.exec)

    commas.context.provide('shell', {
      command: 'exec',
      raw: true,
      async handler(argv) {
        try {
          const { stdout } = await execa(argv)
          return stdout.trim()
        } catch (err) {
          const { stderr } = err
          throw new Error(stderr.trim())
        }
      },
    })

    commas.context.provide('shell', {
      command: 'open',
      raw: true,
      handler(argv, event) {
        event.sender.send('open-tab', {
          command: argv,
        })
      },
    })

    commas.context.provide('shell', {
      command: 'select',
      raw: true,
      handler(argv, event) {
        const index = Number.parseInt(argv)
        if (!Number.isNaN(index)) {
          event.sender.send('select-tab', index)
        }
      },
    })

    let context

    commas.context.provide('shell', {
      command: 'eval',
      raw: true,
      handler(argv) {
        const vm = require('vm')
        if (argv === 'reset') {
          context = undefined
          return ''
        }
        if (!context) {
          context = {}
          vm.createContext(context)
        }
        return util.inspect(vm.runInContext(argv, context), {
          showHidden: true,
          showProxy: true,
          colors: true,
        })
      },
    })

    commas.context.provide('shell', {
      command: 'roll',
      handler(argv) {
        const roll = args => {
          switch (args.length) {
            case 0:
              return random(1, 100)
            case 1:
              if (args[0] === '1') return random(0, args[0], true)
              return random(1, args[0])
            default:
              return random(args[0], args[1])
          }
        }
        return argv.r
          ? Array.from({ length: argv.r }).map(() => roll(argv._)).join('\n')
          : roll(argv._)
      },
    })

    let loadedCommands = []
    const reactiveEffect = effect(() => {
      const commands = unref(useExternalURLCommands())
      commas.context.cancelProviding('shell', ...loadedCommands)
      commas.context.provide('shell', ...commands)
      loadedCommands = commands
    })
    commas.app.onCleanup(() => {
      stop(reactiveEffect)
    })

    commas.keybinding.add({
      label: 'Open shell#!shell.2',
      accelerator: 'CmdOrCtrl+P',
      command: 'open-shell-pane',
    })

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    commas.ipcRenderer.on('open-shell-pane', () => {
      commas.workspace.openPaneTab('shell')
    })

    commas.workspace.registerTabPane('shell', {
      title: 'Shell#!shell.1',
      component: commas.bundler.extract('shell/shell-pane.vue').default,
      icon: {
        name: 'feather-icon icon-terminal',
      },
    })

    commas.context.provide('preference', {
      component: commas.bundler.extract('shell/shell-link.vue').default,
      group: 'feature',
    })

    const tab = commas.workspace.getPaneTab('shell')
    const { initializeShellTerminal } = commas.bundler.extract('shell/terminal.ts')
    initializeShellTerminal(tab)

  }
}
