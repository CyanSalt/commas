const app = require('./modules/app')
const workspace = require('./modules/workspace')
const noConflictModule = require('./modules/module')
const storage = require('./modules/storage')

module.exports = {
  app,
  workspace,
  module: noConflictModule,
  storage,
}
