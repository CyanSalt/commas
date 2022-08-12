import type { Component } from 'vue'
import type { Terminal } from 'xterm'
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

export interface TerminalTabGroup {
  type: string,
  id: number,
  title: string,
  icon?: IconEntry,
}

export interface TerminalInfo {
  pid: number,
  process: string,
  cwd: string,
  shell: string,
}

export interface TerminalTabAddons {
  shellIntegration: ShellIntegrationAddon,
  fit: FitAddon,
  ligatures: LigaturesAddon,
  search: SearchAddon,
  unicode11: Unicode11Addon,
  webgl: WebglAddon,
  weblinks: WebLinksAddon,
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
  group?: TerminalTabGroup,
}
