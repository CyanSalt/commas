const app = require('./modules/app')
const bundler = require('./modules/bundler')
const ipcRenderer = require('./modules/ipc-renderer')
const storage = require('./modules/storage')
const workspace = require('./modules/workspace')

module.exports = {
  app,
  workspace,
  bundler,
  storage,
  ipcRenderer,
}
