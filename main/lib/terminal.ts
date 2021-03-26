import * as fs from 'fs'
import * as os from 'os'
import { shallowRef } from '@vue/reactivity'
import type { WebContents } from 'electron'
import { app, ipcMain } from 'electron'
import memoize from 'lodash/memoize'
import type { IPty, IPtyForkOptions } from 'node-pty'
import * as pty from 'node-pty'
import type { TerminalInfo } from '../../typings/terminal'
import { execa } from '../utils/helper'
import { provideIPC } from '../utils/hooks'
import { getSettings } from './settings'

async function getShells() {
  if (process.platform === 'win32') return []
  try {
    const { stdout } = await execa('grep "^/" /etc/shells')
    return stdout.trim().split('\n')
  } catch {
    return []
  }
}

const shellsRef = shallowRef(getShells())

const defaultShell = process.platform === 'win32'
  ? process.env.COMSPEC : process.env.SHELL

const getVariables = memoize(async () => {
  await app.whenReady()
  return {
    LANG: app.getLocale().replace('-', '_') + '.UTF-8',
    TERM_PROGRAM: app.name,
    TERM_PROGRAM_VERSION: app.getVersion(),
  }
})

const ptyProcessMap = new Map<number, IPty>()

interface CreateTerminalOptions {
  webContents: WebContents,
  shell?: string,
  cwd?: string,
}

async function createTerminal(webContents: WebContents, { shell, cwd }: CreateTerminalOptions): Promise<TerminalInfo> {
  const settings = await getSettings()
  const variables = await getVariables()
  const env: Record<string, string> = {
    ...process.env,
    ...variables,
    ...settings['terminal.shell.env'],
  }
  // Fix NVM `npm_config_prefix` error in development environment
  if (!app.isPackaged && env.npm_config_prefix) {
    delete env.npm_config_prefix
  }
  if (!shell) {
    shell = settings['terminal.shell.path'] || defaultShell
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
    args = settings['terminal.shell.args.windows']
  } else {
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
  webContents.on('destroyed', () => {
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
      // TODO: no command supported on Windows
      if (process.platform === 'darwin') {
        const { stdout } = await execa(`lsof -p ${pid} | grep cwd`)
        return stdout.slice(stdout.indexOf('/'), -1)
      } else if (process.platform === 'linux') {
        return fs.promises.readlink(`/proc/${pid}/cwd`)
      }
    } catch {
      return ''
    }
  })
  ipcMain.handle('get-git-branch', async (event, directory: string) => {
    const command = process.platform === 'win32'
      ? 'git rev-parse --abbrev-ref HEAD 2> NUL'
      : 'git branch 2> /dev/null | grep \\* | cut -d " " -f2'
    try {
      const { stdout } = await execa(command, { cwd: directory })
      return stdout
    } catch {
      // Git for Windows will throw error if the directory is not a repository
      return ''
    }
  })
  provideIPC('shells', shellsRef)
}

export {
  handleTerminalMessages,
}
