const app = require('./modules/app')
const ipcRenderer = require('./modules/ipc-renderer')
const noConflictModule = require('./modules/module')
const storage = require('./modules/storage')
const workspace = require('./modules/workspace')

module.exports = {
  app,
  workspace,
  module: noConflictModule,
  storage,
  ipcRenderer,
}
