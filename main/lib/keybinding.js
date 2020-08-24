const { ipcMain } = require('electron')
const memoize = require('lodash/memoize')
const { userData } = require('../utils/directory')

function loadKeyBindings() {
  return userData.load('keybindings.json') || []
}

const getKeyBindings = memoize(() => {
  return loadKeyBindings()
})

function handleKeyBindingMessages() {
  ipcMain.handle('get-keybindings', () => {
    return getKeyBindings()
  })
}

module.exports = {
  getKeyBindings,
  handleKeyBindingMessages,
}
