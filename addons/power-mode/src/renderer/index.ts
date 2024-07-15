import * as commas from 'commas:api/renderer'
import { PowerMode } from './xterm'

declare module '@commas/types/terminal' {
  export interface TerminalTabAddons {
    powerMode: PowerMode,
  }
}

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'toggle-power-mode': (active: boolean) => void,
  }
}

export default () => {

  const toggle = commas.workspace.registerXtermAddon('powerMode', () => new PowerMode())

  commas.ipcRenderer.on('toggle-power-mode', (event, active) => {
    toggle(active)
  })

}
