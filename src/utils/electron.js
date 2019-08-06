import {app as mainProcessApp, remote} from 'electron'
import {join} from 'path'

export const isMainProcess = process.type === 'browser'

export const app = isMainProcess ? mainProcessApp : remote.app

export const src = isMainProcess ? join(__dirname, '../') : __dirname

export const onAppReady = callback => {
  if (isMainProcess && !app.isReady()) app.on('ready', callback)
  else callback()
}
