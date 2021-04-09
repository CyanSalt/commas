import { app } from 'electron'

const defaultShell = process.platform === 'win32'
  ? process.env.COMSPEC : process.env.SHELL

const defaultEnv = { ...process.env }
// Fix NVM `npm_config_prefix` error in development environment
if (!app.isPackaged && defaultEnv.npm_config_prefix) {
  delete defaultEnv.npm_config_prefix
}

export {
  defaultShell,
  defaultEnv,
}
