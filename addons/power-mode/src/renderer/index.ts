import * as commas from 'commas:api/renderer'
import { PowerMode } from './xterm'

export default () => {

  const toggle = commas.workspace.registerXtermAddon('powerMode', () => new PowerMode())

  commas.ipcRenderer.on('toggle-power-mode', (event, active) => {
    toggle(active)
  })

}
