module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    const path = require('path')

    commas.i18n.addTranslationDirectory(path.join(__dirname, 'locales'))

  } else {

    const { PowerMode } = commas.bundler.extract('power-mode/xterm.ts')

    const instances = []

    const openPowerMode = tab => {
      const xterm = tab.xterm
      if (!xterm) return
      const powerMode = new PowerMode()
      tab.addons.powerMode = powerMode
      xterm.loadAddon(powerMode)
      instances.push(powerMode)
    }

    commas.hooks.useTerminalTabs().value.forEach(openPowerMode)

    commas.app.events.on('terminal-tab-mounted', openPowerMode)

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
