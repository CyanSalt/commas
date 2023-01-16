import * as os from 'os'
import * as path from 'path'
import { app } from 'electron'
import { quote } from 'shell-quote'
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
    COMMAS_MAIN_FILE: __filename,
    COMMAS_MAIN_PID: String(process.pid),
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

interface ShellContext {
  shell: string,
  args: string[],
  env: Record<string, string>,
}

function integrateShell(context: ShellContext) {
  const shell = path.basename(context.shell)
  let args = [...context.args]
  let env: Record<string, string> = {
    ...context.env,
    COMMAS_SHELL_INTEGRATION: '1',
  }
  switch (shell) {
    case 'bash': {
      let isLoginShell = false
      let newArgs: string[] = []
      for (const arg of args) {
        if (arg === '--login') {
          isLoginShell = true
        } else if (/^-[a-z]/.test(arg) && arg.includes('l')) {
          isLoginShell = true
          newArgs.push(arg.replace('l', ''))
        } else {
          newArgs.push(arg)
        }
      }
      args = newArgs
      if (isLoginShell) {
        env['COMMAS_SHELL_LOGIN'] = '1'
      }
      args.push('--init-file', `${BIN_PATH}/.shell-integration/bash.sh`)
      break
    }
    case 'zsh':
      args.push('-i')
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      env['USER_ZDOTDIR'] = env.ZDOTDIR ?? os.homedir() ?? '~'
      env['ZDOTDIR'] = `${BIN_PATH}/.shell-integration/zsh`
      break
  }
  return {
    args,
    env,
  }
}

function loginExecute(command: string) {
  const env = getDefaultEnv()
  if (process.platform === 'win32') {
    return execa(command, { env })
  } else {
    const shell = getDefaultShell()
    return execa(quote([shell!, '-lic', command]), { env })
  }
}

export {
  getDefaultShell,
  getDefaultEnv,
  integrateShell,
  loginExecute,
}
