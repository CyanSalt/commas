import { app as mainProcessApp, remote } from 'electron'
import { join } from 'path'

export const isMainProcess = process.type === 'browser'

export const rootDir = isMainProcess ? join(__dirname, '../../') : join(__dirname, '../')

export const assetsDir = join(rootDir, 'assets/')

const app = isMainProcess ? mainProcessApp : remote.app

export const userDataDir = app.isPackaged
  ? app.getPath('userData') : join(rootDir, 'userdata/')
