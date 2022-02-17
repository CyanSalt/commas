/**
 * @param {import('../../api/types').Commas} commas
 */
module.exports = function (commas) {
  if (commas.app.isMainProcess()) {

    commas.context.provide('cli', {
      command: 'power',
      async handler({ argv }, event) {
        const [status] = argv
        event.sender.send('toggle-power-mode', status !== 'off')
      },
    })

  } else {

    const { PowerMode } = commas.bundler.extract('power-mode/renderer/xterm.ts')

    const toggle = commas.workspace.effectTerminalTab((tab, active) => {
      if (active && !tab.addons.powerMode) {
        const powerMode = new PowerMode()
        tab.addons.powerMode = powerMode
        tab.xterm.loadAddon(powerMode)
      } else if (!active && tab.addons.powerMode) {
        tab.addons.powerMode.dispose()
        delete tab.addons.powerMode
      }
    })

    commas.ipcRenderer.on('toggle-power-mode', (event, active) => {
      toggle(active)
    })

  }
}
