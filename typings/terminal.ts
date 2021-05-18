import type { IconEntry } from '../renderer/assets/icons'
import type { Terminal } from 'xterm'

export interface TerminalTabPane {
  title: string,
  icon: IconEntry,
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
