import * as fs from 'fs'
import * as os from 'os'
import { app, ipcMain } from 'electron'
import type { WebContents } from 'electron'
import * as pty from 'node-pty'
import type { IPty, IPtyForkOptions } from 'node-pty'
import type { TerminalInfo } from '../../typings/terminal'
import { execa } from '../utils/helper'
import { integrateShell, getDefaultEnv, getDefaultShell } from '../utils/shell'
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
  let env = {
    ...getDefaultEnv(),
    ...settings['terminal.shell.env'],
    COMMAS_SENDER_ID: String(webContents.id),
  } as Record<string, string>
  let args = process.platform === 'win32'
    ? settings['terminal.shell.windowsArgs']
    : settings['terminal.shell.args']
  if (settings['terminal.shell.integration']) {
    const result = integrateShell({ shell: shell!, args, env })
    args = result.args
    env = result.env
  }
  const options: IPtyForkOptions = {
    name: 'xterm-256color',
    cwd,
    env,
  }
  if (process.platform !== 'win32') {
    options.encoding = 'utf8'
  }
  const ptyProcess = pty.spawn(shell!, args, options)
  ptyProcess.onData(data => {
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
  ipcMain.handle('get-terminal-cwd', async (event, pid: number) => {
    try {
      if (process.platform === 'darwin') {
        const { stdout } = await execa(`lsof -p ${pid} | grep cwd`)
        return stdout.slice(stdout.indexOf('/'), -1)
      } else if (process.platform === 'linux') {
        return await fs.promises.readlink(`/proc/${pid}/cwd`)
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
