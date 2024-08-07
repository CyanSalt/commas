import type { CanvasAddon } from '@xterm/addon-canvas'
import type { FitAddon } from '@xterm/addon-fit'
import type { ImageAddon } from '@xterm/addon-image'
import type { LigaturesAddon } from '@xterm/addon-ligatures'
import type { SearchAddon } from '@xterm/addon-search'
import type { SerializeAddon } from '@xterm/addon-serialize'
import type { Unicode11Addon } from '@xterm/addon-unicode11'
import type { WebLinksAddon } from '@xterm/addon-web-links'
import type { WebglAddon } from '@xterm/addon-webgl'
import type { Terminal } from '@xterm/xterm'
import type { Component } from 'vue'
import type { RendererEvents } from '@commas/electron-ipc'
import type { IconEntry } from '../renderer/assets/icons'
import type { ShellIntegrationAddon } from '../renderer/utils/shell-integration'

export interface TerminalTabPane {
  name?: string,
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

export type TerminalTabCharacterCommand = keyof {
  [K in keyof RendererEvents as Parameters<RendererEvents[K]> extends [TerminalTabCharacter] ? K : never]: unknown
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

export interface ReadonlyTerminalTabAddons {
  fit: FitAddon,
  ligatures?: LigaturesAddon,
  unicode11: Unicode11Addon,
  webgl?: WebglAddon,
  canvas?: CanvasAddon,
  serialize: SerializeAddon,
}

export interface TerminalTabAddons extends ReadonlyTerminalTabAddons {
  shellIntegration?: ShellIntegrationAddon,
  search: SearchAddon,
  weblinks: WebLinksAddon,
  image?: ImageAddon,
}

export interface CommandCompletion {
  value: string,
  query: string,
  type?: 'history' | 'file' | 'directory' | 'recommendation' | 'third-party' | 'command' | 'default',
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
  state: {
    open: PromiseWithResolvers<void>,
    stop: PromiseWithResolvers<void>,
  },
  alerting?: boolean,
  idle?: boolean,
  command?: string,
  thumbnail?: string,
  pane?: TerminalTabPane,
  character?: TerminalTabCharacter,
  group?: bigint,
  position?: TerminalTabPosition,
  stickyXterm?: Terminal,
  stickyAddons?: ReadonlyTerminalTabAddons,
}
