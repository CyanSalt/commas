import * as commas from 'commas:api/renderer'
import { PowerMode } from './xterm'

declare module '../../../../src/typings/terminal' {
  export interface TerminalTabAddons {
    powerMode: PowerMode,
  }
}

export default () => {

  const toggle = commas.workspace.registerXtermAddon('powerMode', () => new PowerMode())

  commas.ipcRenderer.on('toggle-power-mode', (event, active) => {
    toggle(active)
  })

}
