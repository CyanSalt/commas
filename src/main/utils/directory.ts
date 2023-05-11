import * as path from 'node:path'
import { app } from 'electron'

const rootDir = app.getAppPath()

const userDataDir = app.isPackaged
  ? path.join(app.getPath('userData'), 'User')
  : path.join(rootDir, 'userdata/')
const resourcesDir = path.join(rootDir, 'resources/')

function userFile(...paths: string[]) {
  return path.join(userDataDir, ...paths)
}

function resourceFile(...paths: string[]) {
  return path.join(resourcesDir, ...paths)
}

export {
  userFile,
  resourceFile,
}
