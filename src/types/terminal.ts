import type { RendererEvents } from '@commas/electron-ipc'
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
import type { ShellIntegrationAddon } from '../renderer/utils/shell-integration'

export interface IconEntry {
  name: string,
  patterns?: (string | RegExp)[],
  color?: string,
}

export interface TerminalTabPane {
  name?: string,
  title: string,
  icon?: IconEntry,
  component: Component<{ tab: TerminalTab }>,
  instance?: {
    save?: () => void,
    rename?: (name: string) => void,
  },
  volatile?: boolean,
  factory?: (
    info?: Partial<TerminalTab>
  ) => Partial<TerminalTab> | undefined | Promise<Partial<TerminalTab> | undefined>,
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
  // Difference between `command`, `cwd`, `shell` and `process`
  // `shell`: Unique key for pane tab if `pid` is empty. The tab will be considered as revalent to a **FILE** if shell is not empty. `process` will inherit this unless `shell` is `TERMINAL_DIRECTORY_SHELL`
  // `process`: Can be changed during tab running. The file will be considered as a directory if `process` is equal to `cwd` while `shell` is not empty
  // `cwd`: Can be changed during tab running.
  // `command`: Can be changed during tab running. Will ususally be saved.
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
  iconURL?: string,
}

export interface TerminalExecutor {
  // `directory` may omit home directory, while `cwd` is always an absolute path
  directory?: string,
  shell?: string,
  command?: string,
  explorer?: string,
  remote?: string,
  login?: boolean,
}
