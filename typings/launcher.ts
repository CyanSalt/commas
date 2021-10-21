export interface Launcher {
  id: number,
  name: string,
  command: string,
  directory?: string,
  login?: boolean,
  remote?: boolean,
  external?: string,
  scripts?: Omit<Launcher, 'id'>[],
}
