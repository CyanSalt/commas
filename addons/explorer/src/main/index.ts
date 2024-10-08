import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as commas from 'commas:api/main'
import { sortBy } from 'lodash'
import type { FileEntity } from '../types/file'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'read-directory': (directory: string) => FileEntity[],
    'read-symlink': (file: string) => string,
  }
}

export default () => {

  commas.ipcMain.handle('read-directory', async (event, directory) => {
    const readingDir = directory || os.homedir()
    const entities = await fs.promises.readdir(readingDir, { withFileTypes: true })
    return sortBy(entities.map<FileEntity>(entity => ({
      name: entity.name,
      path: path.join(entity.parentPath, entity.name),
      isDirectory: entity.isDirectory(),
      isSymlink: entity.isSymbolicLink(),
    })), [
      entity => (entity.isDirectory ? 0 : 1),
      entity => entity.name,
    ])
  })

  commas.ipcMain.handle('read-symlink', async (event, file) => {
    const target = await fs.promises.readlink(file)
    return path.join(path.dirname(file), target)
  })

}
