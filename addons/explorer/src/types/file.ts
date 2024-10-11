export interface FileEntity {
  name: string,
  path: string,
  isDirectory: boolean,
  symlink?: string,
}
