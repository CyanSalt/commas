import * as path from 'path'
import { app } from 'electron'
import { execa } from './helper'

const BIN_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'bin')
  : path.resolve(__dirname, '../../bin')

function getDefaultShell() {
  return process.platform === 'win32'
    ? process.env.COMSPEC : process.env.SHELL
}

function getDefaultEnv() {
  const defaultEnv: Record<string, string> = {
    ...process.env,
    LANG: app.getLocale().replace('-', '_') + '.UTF-8',
    TERM_PROGRAM: app.name,
    TERM_PROGRAM_VERSION: app.getVersion(),
    TERM_PROGRAM_BIN: app.getPath('exe'),
    PATH: process.env.PATH ? `${process.env.PATH}:${BIN_PATH}` : BIN_PATH,
  }
  // Fix NVM `npm_config_prefix` error in development environment
  if (!app.isPackaged && defaultEnv.npm_config_prefix) {
    delete defaultEnv.npm_config_prefix
  }
  return defaultEnv
}

function loginExecute(command: string) {
  const shell = getDefaultShell()
  const env = getDefaultEnv()
  return execa(`${shell} -lic '${command}'`, { env })
}

export {
  getDefaultShell,
  getDefaultEnv,
  loginExecute,
}