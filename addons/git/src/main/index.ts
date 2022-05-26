import * as os from 'os'
import * as commas from 'commas:api/main'

commas.ipcMain.handle('get-git-branch', async (event, directory: string) => {
  const command = `git rev-parse --abbrev-ref HEAD 2> ${os.devNull}`
  try {
    const { stdout } = await commas.shell.execute(command, { cwd: directory })
    return stdout.trim()
  } catch {
    // Git for Windows will throw error if the directory is not a repository
    return ''
  }
})

commas.ipcMain.handle('get-git-remote-url', async (event, directory: string) => {
  const command = `git ls-remote --get-url 2> ${os.devNull}`
  try {
    const { stdout } = await commas.shell.execute(command, { cwd: directory })
    return stdout.trim()
  } catch {
    // Git for Windows will throw error if the directory is not a repository
    return ''
  }
})
