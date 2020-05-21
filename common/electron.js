import { app as mainProcessApp, remote } from 'electron'
import { join } from 'path'

export const isMainProcess = process.type === 'browser'

export const app = isMainProcess ? mainProcessApp : remote.app

/**
 * @param {(launchInfo: unknown) => void} callback
 */
export const onAppReady = callback => {
  if (isMainProcess && !app.isReady()) app.on('ready', callback)
  else callback()
}

export const isPackaged = app.isPackaged

export const rootDir = isMainProcess ? join(__dirname, '../../') : join(__dirname, '../')

export const assetsDir = join(rootDir, 'assets/')

export const userDataDir = isPackaged
  ? app.getPath('userData') : join(rootDir, 'userdata/')
