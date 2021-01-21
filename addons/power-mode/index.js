module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.i18n.addTranslation(['zh', 'zh-CN'], require('./locales/zh-CN.json'))

  } else {

    const { PowerMode } = commas.bundler.extract('power-mode/xterm.ts')

    const instances = []

    commas.app.events.on('terminal-tab-mounted', tab => {
      const xterm = tab.xterm
      const powerMode = new PowerMode()
      tab.addons.powerMode = powerMode
      xterm.loadAddon(powerMode)
      instances.push(powerMode)
    })

    commas.app.onCleanup(() => {
      instances.forEach(instance => {
        instance.dispose()
      })
    })

    commas.reactive.provide('user-settings:terminal.addon.includes', {
      value: 'power-mode',
      note: 'Turn on power mode#!power-mode.1',
    })

  }
}
