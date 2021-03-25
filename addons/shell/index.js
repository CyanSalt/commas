module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const childProcess = require('child_process')
    const path = require('path')
    const util = require('util')
    const { app } = require('electron')
    const random = require('lodash/random')
    const { executeCommand, getExternalURLCommands } = commas.bundler.extract('shell/command.ts')

    commas.ipcMain.handle('get-shell-commands', async () => {
      const commands = commas.context.getCollection('shell')
      return commands.flatMap(item => item.command)
    })

    commas.ipcMain.handle('execute-shell-command', async (event, line) => {
      const commands = commas.context.getCollection('shell')
      return executeCommand(event, line, commands)
    })

    commas.context.provide('shell', {
      command: ['commas'],
      handler() {
        return app.getVersion()
      },
    })

    const execa = util.promisify(childProcess.exec)

    commas.context.provide('shell', {
      command: ['exec'],
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
      command: ['open'],
      raw: true,
      handler(argv) {
        const frame = commas.frame.getFocusedWindow()
        frame.webContents.send('open-tab', {
          command: argv,
        })
      },
    })

    let context

    commas.context.provide('shell', {
      command: ['javascript', 'js'],
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
      command: ['roll'],
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
    const loadExternalURLCommands = async () => {
      const commands = await getExternalURLCommands()
      commas.context.cancelProviding('shell', ...loadedCommands)
      commas.context.provide('shell', ...commands)
      loadedCommands = commands
    }

    loadExternalURLCommands()
    const events = commas.settings.getEvents()
    events.on('updated', () => {
      loadExternalURLCommands()
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
