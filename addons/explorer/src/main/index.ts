import * as fs from 'node:fs'
import * as os from 'node:os'
import * as path from 'node:path'
import * as commas from 'commas:api/main'
import { sortBy } from 'lodash'
import type { FileEntity } from '../types/file'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'read-directory': (directory: string) => FileEntity[],
    'access-directory': (directory: string) => string | undefined,
  }
}

export default () => {

  commas.ipcMain.handle('read-directory', async (event, directory) => {
    const readingDir = directory || os.homedir()
    const dirents = await fs.promises.readdir(readingDir, { withFileTypes: true })
    const entities: FileEntity[] = await Promise.all(dirents.map(async dirent => {
      const fullPath = path.join(dirent.parentPath, dirent.name)
      const isSymlink = dirent.isSymbolicLink()
      const symlink = isSymlink
        ? path.join(dirent.parentPath, await fs.promises.readlink(fullPath))
        : undefined
      const stats = symlink
        ? await fs.promises.stat(symlink)
        : dirent
      return {
        name: dirent.name,
        path: fullPath,
        isDirectory: stats.isDirectory(),
        symlink,
      }
    }))
    return sortBy(entities, [
      entity => (entity.isDirectory ? 0 : 1),
      entity => entity.name,
    ])
  })

  commas.ipcMain.handle('access-directory', async (event, directory) => {
    const dir = commas.helper.resolveHome(directory)
    try {
      await fs.promises.access(dir)
      return dir
    } catch {
      // ignore
    }
  })

  commas.context.provide('cli.command', {
    command: 'ls',
    description: 'List files in directory#!cli.description.list',
    usage: '[directory]#!cli.usage.list',
    async handler({ sender, argv, cwd }) {
      const directory = argv.length ? path.resolve(cwd, argv[0]) : cwd
      await fs.promises.access(directory, fs.constants.R_OK)
      commas.frame.send(sender, 'open-explorer', directory)
    },
  })

  commas.i18n.addTranslationDirectory('locales')

  commas.keybinding.addKeyBindingsFile('keybindings.json')

}
