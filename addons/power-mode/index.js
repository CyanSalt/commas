/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.context.provide('shell', {
      command: 'power',
      async handler(argv) {
        const [status] = argv._
        const frame = commas.frame.getFocusedWindow()
        frame.webContents.send('toggle-power-mode', status !== 'off')
      },
    })

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

    const enable = () => {
      commas.workspace.getTerminalTabs().forEach(openPowerMode)
      commas.app.events.on('terminal-tab-mounted', openPowerMode)
    }

    const disable = () => {
      instances.forEach(instance => {
        instance.dispose()
      })
      commas.app.events.off('terminal-tab-mounted', openPowerMode)
    }

    commas.app.onCleanup(() => {
      disable()
    })

    let enabled = false

    commas.ipcRenderer.on('toggle-power-mode', (event, active) => {
      if (enabled && !active) {
        enabled = false
        disable()
      } else if (!enabled && active) {
        enabled = true
        enable()
      }
    })

  }
}
