import {app as mainProcessApp, remote} from 'electron'
import {join} from 'path'

export const isMainProcess = process.type === 'browser'

export const app = isMainProcess ? mainProcessApp : remote.app

export const onAppReady = callback => {
  if (isMainProcess && !app.isReady()) app.on('ready', callback)
  else callback()
}

export const appDir = isMainProcess ? join(__dirname, '../') : __dirname

export const assetsDir = join(appDir, 'assets/')

export const userDataDir = app.isPackaged ?
  app.getPath('userData') : join(appDir, '..', 'userdata/')
