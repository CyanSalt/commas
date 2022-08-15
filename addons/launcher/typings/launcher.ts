export interface LauncherInfo {
  name: string,
  command: string,
  directory?: string,
  login?: boolean,
  remote?: string,
  explorer?: string,
  scripts?: LauncherInfo[],
}

export interface Launcher extends LauncherInfo {
  id: string,
}
