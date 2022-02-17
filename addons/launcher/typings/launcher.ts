export interface Launcher {
  id: number,
  name: string,
  command: string,
  directory?: string,
  login?: boolean,
  remote?: string,
  explorer?: string,
  scripts?: Omit<Launcher, 'id'>[],
}
