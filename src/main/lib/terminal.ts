import * as fs from 'node:fs'
import * as os from 'node:os'
import type { WebContents } from 'electron'
import { app } from 'electron'
import type { IPty, IPtyForkOptions } from 'node-pty'
import * as pty from 'node-pty'
import { ipcMain } from '@commas/electron-ipc'
import type { CommandCompletion, TerminalContext, TerminalInfo } from '@commas/types/terminal'
import type { CompletionShellContext } from '../utils/completion'
import { getCompletions, refreshCompletions } from '../utils/completion'
import { execute } from '../utils/helper'
import { getDefaultEnv, getDefaultShell, integrateShell } from '../utils/shell'
import { send } from './frame'
import { useSettings, whenSettingsReady } from './settings'

declare module '@commas/electron-ipc' {
  export interface Commands {
    'create-terminal': (data: Partial<TerminalContext>) => ReturnType<typeof createTerminal>,
    'write-terminal': (pid: number, data: string) => void,
    'resize-terminal': (pid: number, data: { cols: number, rows: number }) => void,
    'close-terminal': (pid: number) => void,
    'get-terminal-cwd': (pid: number) => string,
    'get-shells': () => string[],
    'get-completions': (input: string, context: CompletionShellContext) => Promise<CommandCompletion[]>,
  }
  export interface Events {
    'terminal-prompt-end': () => void,
  }
}

const ptyProcessMap = new Map<number, IPty>()

async function createTerminal(
  webContents: WebContents,
  { shell, args, env, cwd }: Partial<TerminalContext>,
): Promise<TerminalInfo> {
  await Promise.all([
    whenSettingsReady(),
    app.whenReady(),
  ])
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
  const settings = useSettings()
  if (!shell) {
    shell = settings['terminal.shell.path'] || getDefaultShell()!
  }
  if (!args) {
    args = process.platform === 'win32'
      ? settings['terminal.shell.windowsArgs']
      : settings['terminal.shell.args']
  }
  if (!env) {
    env = settings['terminal.shell.env']
  }
  let runtimeEnv: Record<string, string> = {
    ...getDefaultEnv(),
    ...env,
    COMMAS_SENDER_ID: String(webContents.id),
  }
  let runtimeArgs = args
  if (settings['terminal.shell.integration']) {
    const result = integrateShell({ shell, args: runtimeArgs, env: runtimeEnv })
    runtimeArgs = result.args
    runtimeEnv = result.env
  }
  const options: IPtyForkOptions = {
    name: 'xterm-256color',
    cwd,
    env: runtimeEnv,
  }
  if (process.platform !== 'win32') {
    options.encoding = 'utf8'
  }
  const ptyProcess = pty.spawn(shell, runtimeArgs, options)
  ptyProcess.onData(data => {
    if (!webContents.isDestroyed()) {
      send(webContents, 'print-terminal', {
        pid: ptyProcess.pid,
        process: ptyProcess.process,
        data,
      })
    }
  })
  const handleDestroy = () => {
    ptyProcess.kill()
  }
  webContents.once('destroyed', handleDestroy)
  ptyProcess.onExit(data => {
    ptyProcessMap.delete(ptyProcess.pid)
    webContents.off('destroyed', handleDestroy)
    if (!webContents.isDestroyed()) {
      send(webContents, 'exit-terminal', { pid: ptyProcess.pid })
    }
  })
  ptyProcessMap.set(ptyProcess.pid, ptyProcess)
  return {
    pid: ptyProcess.pid,
    process: ptyProcess.process,
    cwd,
    shell,
    args,
    env,
  }
}

function handleTerminalMessages() {
  const settings = useSettings()
  ipcMain.handle('create-terminal', (event, data) => {
    return createTerminal(event.sender, data)
  })
  ipcMain.handle('write-terminal', (event, pid, data) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess?.write(data)
  })
  ipcMain.handle('resize-terminal', (event, pid, data) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess?.resize(data.cols, data.rows)
  })
  ipcMain.handle('close-terminal', (event, pid) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess?.kill()
  })
  ipcMain.handle('get-terminal-cwd', async (event, pid) => {
    try {
      if (process.platform === 'darwin') {
        const { stdout } = await execute(`lsof -p ${pid} | grep cwd`)
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
      const { stdout } = await execute('grep "^/" /etc/shells')
      return stdout.trim().split('\n')
    } catch {
      return []
    }
  })
  ipcMain.handle('get-completions', (event, input, context) => {
    return getCompletions(input, context, settings['terminal.shell.captureCompletion'])
  })
  ipcMain.on('terminal-prompt-end', () => {
    refreshCompletions()
  })
}

export {
  handleTerminalMessages,
}
