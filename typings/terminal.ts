import type { ITerminalAddon, Terminal } from 'xterm'
import type { IconEntry } from '../src/renderer/assets/icons'

export interface TerminalTabPane {
  type?: string,
  title: string,
  icon?: IconEntry,
  component: any,
  instance?: any,
}

export interface TerminalTabGroup {
  type: string,
  title: string,
  icon?: IconEntry,
  data: any,
}

export interface TerminalInfo {
  pid: number,
  process: string,
  cwd: string,
  shell: string,
}

export interface XtermBufferPosition {
  x: number,
  y: number,
}

export interface XtermLink {
  uri: string,
  start: XtermBufferPosition,
  end?: XtermBufferPosition,
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TerminalTabAddons extends Record<string, ITerminalAddon> {}

export interface TerminalTab extends TerminalInfo {
  title: string,
  xterm: Terminal,
  addons: TerminalTabAddons,
  onStop: (() => void)[],
  links: XtermLink[],
  alerting?: boolean,
  pane?: TerminalTabPane,
  group?: TerminalTabGroup,
}
