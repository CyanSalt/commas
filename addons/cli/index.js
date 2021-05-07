/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')
    const util = require('util')
    const { app } = require('electron')
    const random = require('lodash/random')
    const { computed, effect, stop, unref } = require('@vue/reactivity')
    const { executeCommand, resolveCommandAliases, useExternalURLCommands } = commas.bundler.extract('cli/main/command.ts')

    const commands = commas.context.getCollection('cli')
    commas.ipcMain.handle('cli', (event, args) => {
      const settings = commas.settings.getSettings()
      const aliases = settings['cli.command.aliases'] ?? {}
      return executeCommand(event, resolveCommandAliases(args, aliases), commands)
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
      const settings = commas.settings.getSettings()
      const aliases = settings['cli.command.aliases'] ?? {}
      return [
        ...commands.map(item => item.command),
        ...Object.keys(aliases),
      ]
    })

    commas.context.provide('cli', {
      command: 'help',
      handler() {
        return [
          '\nUsage: commas <command>\n',
          '\nwhere <command> is one of:',
          '\n    ' + wrap(unref(commandListRef)) + '\n',
        ].join('')
      },
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
