const { app, ipcMain, BrowserWindow } = require('electron')
const pty = require('node-pty')
const memoize = require('lodash/memoize')
const fs = require('fs')
const { execa } = require('../utils/helper')
const { getSettings } = require('./settings')

/**
 * @typedef {import('node-pty').IPty} IPty
 */

const getShells = memoize(async () => {
  if (process.platform === 'win32') return []
  try {
    const { stdout } = await execa('grep "^/" /etc/shells')
    return stdout.trim().split('\n')
  } catch {
    return []
  }
})

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

/**
 * @type Map<string, IPty>
 */
const ptyProcessMap = new Map()

/**
 *
 * @param {object} options
 * @param {number} frameId
 * @param {string=} options.shell
 * @param {string=} options.cwd
 */
async function createTerminal(frameId, { shell, cwd }) {
  const settings = await getSettings()
  const variables = await getVariables()
  const env = {
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
  if (!cwd) {
    cwd = env.HOME
  }
  const options = {
    name: 'xterm-256color',
    cwd,
    env,
  }
  let args = settings['terminal.shell.args']
  if (process.platform === 'win32') {
    args = settings['terminal.shell.args.windows']
  } else {
    options.encoding = 'utf8'
  }
  const ptyProcess = pty.spawn(shell, args, options)
  ptyProcess.onData(data => {
    const frame = BrowserWindow.fromId(frameId)
    frame.webContents.send('input-terminal', {
      pid: ptyProcess.pid,
      process: ptyProcess.process,
      data,
    })
  })
  ptyProcess.onExit(data => {
    ptyProcessMap.delete(ptyProcess.pid)
    const frame = BrowserWindow.fromId(frameId)
    frame.webContents.send('exit-terminal', { pid: ptyProcess.pid, data })
  })
  ptyProcessMap.set(ptyProcess.pid, ptyProcess)
  return {
    pid: ptyProcess.pid,
    process: ptyProcess.process,
    cwd,
    shell,
  }
}

function handleTerminalMessages() {
  ipcMain.handle('create-terminal', (event, data) => {
    return createTerminal(event.frameId, data)
  })
  ipcMain.handle('write-terminal', (event, pid, data) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess.write(data)
  })
  ipcMain.handle('resize-terminal', (event, pid, data) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess.resize(data.cols, data.rows)
  })
  ipcMain.handle('close-terminal', (event, pid) => {
    const ptyProcess = ptyProcessMap.get(pid)
    ptyProcess.kill()
  })
  ipcMain.handle('get-terminal-cwd', async (event, pid) => {
    try {
      // TODO: no command supported on Windows
      if (process.platform === 'darwin') {
        const { stdout } = await execa(`lsof -p ${pid} | grep cwd`)
        return stdout.substring(stdout.indexOf('/'), stdout.length - 1)
      } else if (process.platform === 'linux') {
        return fs.readlink(`/proc/${pid}/cwd`)
      }
    } catch {
      return ''
    }
  })
  ipcMain.handle('get-git-branch', async (event, directory) => {
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
  ipcMain.handle('get-shells', () => {
    return getShells()
  })
}

module.exports = {
  handleTerminalMessages,
}
