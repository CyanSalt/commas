module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const { executeCommand, getExternalURLCommands } = commas.bundler.extract('shell/command.ts')

    commas.ipcMain.handle('execute-shell-command', async (event, line) => {
      const commands = commas.context.shareArray('shell')
      return executeCommand(line, commands)
    })

    commas.context.shareDataIntoArray('shell', {
      command: ['javascript', 'js'],
      raw: true,
      handler(argv) {
        const vm = require('vm')
        const context = {}
        vm.createContext(context)
        return vm.runInContext(argv, context)
      },
    })

    let loadedCommands = []
    const loadExternalURLCommands = async () => {
      const commands = await getExternalURLCommands()
      loadedCommands.forEach(command => {
        commas.context.removeDataFromArray('shell', command)
      })
      commands.forEach(command => {
        commas.context.shareDataIntoArray('shell', command)
      })
      loadedCommands = commands
    }

    loadExternalURLCommands()
    const events = commas.settings.getEvents()
    events.on('updated', () => {
      loadExternalURLCommands()
    })

    commas.settings.addSpecs(require('./settings.spec.json'))

    commas.i18n.addTranslation(['zh', 'zh-CN'], require('./locales/zh-CN.json'))

  } else {

    commas.workspace.registerTabPane('shell', {
      title: 'Shell#!shell.1',
      component: commas.bundler.extract('shell/shell-pane.vue').default,
      icon: {
        name: 'feather-icon icon-terminal',
      },
    })

    commas.reactive.shareDataIntoArray('settings', {
      component: commas.bundler.extract('shell/shell-link.vue').default,
      group: 'feature',
    })

    const tab = commas.workspace.getPaneTab('shell')
    const { initializeShellTerminal } = commas.bundler.extract('shell/terminal.ts')
    initializeShellTerminal(tab)

  }
}
