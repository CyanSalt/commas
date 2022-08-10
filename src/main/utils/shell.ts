import * as path from 'path'
import { app } from 'electron'
import { userFile } from './directory'
import { execa } from './helper'

const BIN_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'bin')
  : path.resolve(__dirname, '../../bin')

function getDefaultShell() {
  return process.platform === 'win32'
    ? 'powershell.exe' // process.env.COMSPEC
    : process.env.SHELL
}

function getDefaultEnv() {
  const PATH_SEP = process.platform === 'win32' ? ';' : ':'
  const defaultEnv: NodeJS.ProcessEnv = {
    ...process.env,
    LANG: app.getLocale().replace('-', '_') + '.UTF-8',
    COLORTERM: 'truecolor',
    TERM_PROGRAM: app.name,
    TERM_PROGRAM_VERSION: app.getVersion(),
    COMMAS_EXE: app.getPath('exe'),
    COMMAS_USERDATA: userFile(),
    // Overwrite the real `Path` on Windows
    Path: process.env.PATH ? `${process.env.PATH}${PATH_SEP}${BIN_PATH}` : BIN_PATH,
    PATH: process.env.PATH ? `${process.env.PATH}${PATH_SEP}${BIN_PATH}` : BIN_PATH,
  }
  // Fix NVM `npm_config_prefix` error in development environment
  if (!app.isPackaged && defaultEnv.npm_config_prefix) {
    delete defaultEnv.npm_config_prefix
  }
  return defaultEnv
}

function applyShellIntegration(shell: string, args: string[]) {
  shell = path.basename(shell)
  const extraArgs: string[] = []
  const extraEnv = {
    COMMAS_SHELL_INTEGRATION: '1',
  }
  switch (shell) {
    case 'bash': {
      extraArgs.push('--init-file', `${BIN_PATH}/.shell-integration/bash.sh`)
      if (['-login', '-l'].some(arg => args.includes(arg))) {
        extraEnv['COMMAS_SHELL_LOGIN'] = '1'
      }
      break
    }
    case 'zsh':
      extraArgs.push('-i')
      extraEnv['ZDOTDIR'] = `${BIN_PATH}/.shell-integration/zsh`
      break
  }
  return {
    args: extraArgs,
    env: extraEnv,
  }
}

function loginExecute(command: string) {
  const env = getDefaultEnv()
  if (process.platform === 'win32') {
    return execa(command, { env })
  } else {
    const shell = getDefaultShell()
    return execa(`${shell} -lic '${command}'`, { env })
  }
}

export {
  getDefaultShell,
  getDefaultEnv,
  applyShellIntegration,
  loginExecute,
}
