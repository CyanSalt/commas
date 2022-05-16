import * as fs from 'fs'
import * as os from 'os'
import { app, ipcMain } from 'electron'
import type { WebContents } from 'electron'
import * as pty from 'node-pty'
import type { IPty, IPtyForkOptions } from 'node-pty'
import type { TerminalInfo } from '../../typings/terminal'
import { execa } from '../utils/helper'
import { getDefaultEnv, getDefaultShell } from '../utils/shell'
import { useSettings, whenSettingsReady } from './settings'

const ptyProcessMap = new Map<number, IPty>()

interface CreateTerminalOptions {
  webContents: WebContents,
  shell?: string,
  cwd?: string,
}

async function createTerminal(webContents: WebContents, { shell, cwd }: CreateTerminalOptions): Promise<TerminalInfo> {
  await Promise.all([
    whenSettingsReady(),
    app.whenReady(),
  ])
  const settings = useSettings()
  const env: Record<string, string> = {
    ...getDefaultEnv(),
    ...settings['terminal.shell.env'],
  }
  if (!shell) {
    shell = settings['terminal.shell.path'] || getDefaultShell()
  }
  if (cwd) {
    try {
      await fs.promises.access(cwd)
    } catch {
      cwd = undefined
    }
  }
  if (!cwd) {
    cwd = os.homedir()
  }
  const options: IPtyForkOptions = {
    name: 'xterm-256color',
    cwd,
    env,
  }
  let args: string[] = settings['terminal.shell.args']
  if (process.platform === 'win32') {
    args = settings['terminal.shell.windowsArgs']
  } else {
    options.encoding = 'utf8'
  }
  const ptyProcess = pty.spawn(shell!, args, options)
  ptyProcess.onData(data => {
    // Custom flow control
    if (data.includes('\u001b]539;')) {
      ptyProcess.pause()
    }
    webContents.send('input-terminal', {
      pid: ptyProcess.pid,
      process: ptyProcess.process,
      data,
    })
  })
  ptyProcess.onExit(data => {
    ptyProcessMap.delete(ptyProcess.pid)
    if (!webContents.isDestroyed()) {
      webContents.send('exit-terminal', { pid: ptyProcess.pid, data })
    }
  })
  webContents.once('destroyed', () => {
    ptyProcess.kill()
  })
  ptyProcessMap.set(ptyProcess.pid, ptyProcess)
  return {
    pid: ptyProcess.pid,
    process: ptyProcess.process,
    cwd,
    shell: shell!,
  }
}

function handleTerminalMessages() {
  ipcMain.handle('create-terminal', (event, data: CreateTerminalOptions) => {
    return createTerminal(event.sender, data)
  })
  ipcMain.handle('write-terminal', (event, pid: number, data: string) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess?.write(data)
  })
  ipcMain.handle('resize-terminal', (event, pid: number, data: { cols: number, rows: number }) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess?.resize(data.cols, data.rows)
  })
  ipcMain.handle('close-terminal', (event, pid: number) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess?.kill()
  })
  ipcMain.handle('resume-terminal', (event, pid: number) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess?.resume()
  })
  ipcMain.handle('get-terminal-cwd', async (event, pid: number) => {
    try {
      if (process.platform === 'darwin') {
        const { stdout } = await execa(`lsof -p ${pid} | grep cwd`)
        return stdout.slice(stdout.indexOf('/'), -1)
      } else if (process.platform === 'linux') {
        return fs.promises.readlink(`/proc/${pid}/cwd`)
      } else {
        // TODO: no command supported on Windows
        throw new Error('Cannot get working directory on Windows')
      }
    } catch {
      return ''
    }
  })
  ipcMain.handle('get-shells', async () => {
    if (process.platform === 'win32') {
      return [
        'powershell.exe',
        'cmd.exe',
        'wsl.exe',
        // 'bash.exe',
        // 'git-cmd.exe',
      ]
    }
    try {
      const { stdout } = await execa('grep "^/" /etc/shells')
      return stdout.trim().split('\n')
    } catch {
      return []
    }
  })
}

export {
  handleTerminalMessages,
}
