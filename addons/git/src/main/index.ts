import * as os from 'node:os'
import * as commas from 'commas:api/main'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'get-git-branch': (directory: string) => string,
    'get-git-remote-url': (directory: string) => string,
  }
}

export default () => {

  commas.ipcMain.handle('get-git-branch', async (event, directory) => {
    const command = `git rev-parse --abbrev-ref HEAD 2> ${os.devNull}`
    try {
      const { stdout } = await commas.shell.execute(command, { cwd: directory })
      return stdout.trim()
    } catch {
      // Git for Windows will throw error if the directory is not a repository
      return ''
    }
  })

  commas.ipcMain.handle('get-git-remote-url', async (event, directory) => {
    const command = `git ls-remote --get-url 2> ${os.devNull}`
    try {
      const { stdout } = await commas.shell.execute(command, { cwd: directory })
      return stdout.trim()
    } catch {
      // Git for Windows will throw error if the directory is not a repository
      return ''
    }
  })

}
