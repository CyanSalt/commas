const app = require('./modules/app')
const directory = require('./modules/directory')
const frame = require('./modules/frame')
const i18n = require('./modules/i18n')
const keybinding = require('./modules/keybinding')
const protocol = require('./modules/protocol')
const settings = require('./modules/settings')

module.exports = {
  app,
  i18n,
  settings,
  frame,
  directory,
  protocol,
  keybinding,
}
