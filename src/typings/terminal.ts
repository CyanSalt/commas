import type { Component } from 'vue'
import type { Terminal } from 'xterm'
import type { CanvasAddon } from 'xterm-addon-canvas'
import type { FitAddon } from 'xterm-addon-fit'
import type { LigaturesAddon } from 'xterm-addon-ligatures'
import type { SearchAddon } from 'xterm-addon-search'
import type { Unicode11Addon } from 'xterm-addon-unicode11'
import type { WebLinksAddon } from 'xterm-addon-web-links'
import type { WebglAddon } from 'xterm-addon-webgl'
import type { IconEntry } from '../renderer/assets/icons'
import type { ShellIntegrationAddon } from '../renderer/utils/shell-integration'
import type { Deferred } from '../shared/helper'

export interface TerminalTabPane {
  type?: string,
  title: string,
  icon?: IconEntry,
  component: Component<{ tab: TerminalTab }>,
  instance?: any,
}

export interface TerminalTabCharacter {
  type: string,
  id: string,
  title?: string,
  icon?: IconEntry,
  defaultIcon?: IconEntry,
}

export interface TerminalContext {
  cwd: string,
  shell: string,
  args: string[],
  env: NodeJS.ProcessEnv,
}

export interface TerminalInfo extends TerminalContext {
  pid: number,
  process: string,
}

export interface TerminalTabAddons {
  shellIntegration?: ShellIntegrationAddon,
  fit: FitAddon,
  ligatures?: LigaturesAddon,
  search: SearchAddon,
  unicode11: Unicode11Addon,
  webgl?: WebglAddon,
  canvas?: CanvasAddon,
  weblinks: WebLinksAddon,
}

export interface CommandCompletion {
  value: string,
  query: string,
  type?: 'history' | 'file' | 'directory' | 'recommendation' | 'command' | 'default',
  description?: string,
}

export interface TerminalTabPosition {
  row: number,
  col: number,
  rowspan?: number,
  colspan?: number,
}

export interface TerminalTab extends TerminalInfo {
  title: string,
  xterm: Terminal,
  addons: TerminalTabAddons,
  deferred: {
    open: Deferred,
    stop: Deferred,
  },
  alerting?: boolean,
  idle?: boolean,
  thumbnail?: string,
  pane?: TerminalTabPane,
  character?: TerminalTabCharacter,
  group?: bigint,
  position?: TerminalTabPosition,
  completions?: CommandCompletion[],
}
