import type { TerminalProfile } from '../../../src/typings/settings'

export interface LauncherInfo {
  name: string,
  command?: string,
  directory?: string,
  login?: boolean,
  remote?: string,
  explorer?: string,
  pane?: string,
  profile?: TerminalProfile,
  scripts?: LauncherInfo[],
}

export interface Launcher extends LauncherInfo {
  id: string,
}
