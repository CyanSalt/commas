module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.ipcMain.handle('execute-shell-command', async (event, command, args) => {
      const controller = commas.context.shareArray('shell').find(item => {
        return item.command === command || item.aliases?.includes(command)
      })
      try {
        if (controller) {
          const stdout = await controller.handler(args)
          return { code: 0, stdout }
        } else {
          throw new Error(`command not found: ${command}`)
        }
      } catch (err) {
        return { code: 1, stderr: err.message }
      }
    })

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
