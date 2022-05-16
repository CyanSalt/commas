import * as os from 'os'
import * as commas from 'commas:api/main'

commas.ipcMain.handle('get-git-branch', async (event, directory: string) => {
  const command = `git rev-parse --abbrev-ref HEAD 2> ${os.devNull}`
  try {
    const { stdout } = await commas.helperMain.execute(command, { cwd: directory })
    return stdout
  } catch {
    // Git for Windows will throw error if the directory is not a repository
    return ''
  }
})
