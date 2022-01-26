import type { Terminal } from 'xterm'
import type { IconEntry } from '../renderer/assets/icons'

export interface TerminalTabPane {
  title: string,
  icon: IconEntry,
  component: any,
}

export interface TerminalInfo {
  pid: number,
  process: string,
  cwd: string,
  shell: string,
}

export interface TerminalTab extends TerminalInfo {
  title: string,
  xterm: Terminal,
  addons: Record<string, any>, // Record<string, ITerminalAddon>
  alerting?: boolean,
  launcher?: number,
  pane?: TerminalTabPane,
}
