/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')
    const util = require('util')
    const { app } = require('electron')
    const random = require('lodash/random')
    const { effect, stop, unref } = require('@vue/reactivity')
    const { executeCommand, resolveCommandAliases, useExternalURLCommands } = commas.bundler.extract('cli/command.ts')

    const commands = commas.context.getCollection('cli')
    commas.ipcMain.handle('cli', (event, args) => {
      const settings = commas.settings.getSettings()
      const aliases = settings['cli.command.aliases']
      return executeCommand(event, resolveCommandAliases(args, aliases), commands)
    })

    commas.context.provide('cli', {
      command: 'version',
      handler() {
        return app.getVersion()
      },
    })

    commas.context.provide('cli', {
      command: 'open',
      handler(argv, event) {
        event.sender.send('open-tab', {
          command: argv.join(' '),
        })
      },
    })

    commas.context.provide('cli', {
      command: 'select',
      handler(argv, event) {
        const index = Number.parseInt(argv[0])
        if (!Number.isNaN(index)) {
          event.sender.send('select-tab', index)
        }
      },
    })

    let context

    commas.context.provide('cli', {
      command: 'eval',
      handler(argv) {
        const script = argv.join(' ')
        const vm = require('vm')
        if (script === 'reset') {
          context = undefined
          return ''
        }
        if (!context) {
          context = {}
          vm.createContext(context)
        }
        return util.inspect(vm.runInContext(script, context), {
          showHidden: true,
          showProxy: true,
          colors: true,
        })
      },
    })

    commas.context.provide('cli', {
      command: 'roll',
      handler(argv) {
        let length = Number.parseInt(argv[0])
        if (Number.isNaN(length)) length = 1
        return Array.from({ length })
          .map(() => random(1, 100)).join('\n')
      },
    })

    const externalURLCommandsRef = useExternalURLCommands()
    let loadedExternalURLCommands = []
    const reactiveEffect = effect(() => {
      const externalURLCommands = unref(externalURLCommandsRef)
      commas.context.cancelProviding('cli', ...loadedExternalURLCommands)
      commas.context.provide('cli', ...externalURLCommands)
      loadedExternalURLCommands = externalURLCommands
    })
    commas.app.onCleanup(() => {
      stop(reactiveEffect)
    })

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  }
}
