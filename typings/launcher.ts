export interface Launcher {
  id: number,
  name: string,
  command: string,
  directory?: string,
  login?: boolean,
  remote?: boolean,
  scripts?: Omit<Launcher, 'id'>[],
}
