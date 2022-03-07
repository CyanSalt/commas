import * as commas from 'commas:api/renderer'
import { PowerMode } from './xterm'

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
