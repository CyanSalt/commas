import { app } from 'electron'
import { execa } from './helper'

const defaultShell = process.platform === 'win32'
  ? process.env.COMSPEC : process.env.SHELL

const defaultEnv = { ...process.env }
// Fix NVM `npm_config_prefix` error in development environment
if (!app.isPackaged && defaultEnv.npm_config_prefix) {
  delete defaultEnv.npm_config_prefix
}

function loginExecute(command: string) {
  return execa(`${defaultShell} -lic '${command}'`, { env: defaultEnv })
}

export {
  defaultShell,
  defaultEnv,
  loginExecute,
}
