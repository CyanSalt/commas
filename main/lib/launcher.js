const { ipcMain } = require('electron')
const memoize = require('lodash/memoize')
const { broadcast } = require('./frame')
const { userData } = require('../utils/directory')
const { createIDGenerator } = require('../utils/helper')

const generateID = createIDGenerator()

async function loadLaunchers() {
  /** @type {any[]} */
  const launchers = await userData.load('launchers.json') || []
  return launchers.map(launcher => ({
    ...launcher,
    id: generateID(),
  }))
}

const getLaunchers = memoize(() => {
  userData.watch('launcher.json', () => {
    getLaunchers.cache.set(undefined, loadLaunchers())
    updateLaunchers()
  })
  return loadLaunchers()
})

async function updateLaunchers() {
  const launchers = await getLaunchers()
  broadcast('launchers-updated', launchers)
}

function handleLauncherMessages() {
  ipcMain.handle('get-launchers', () => {
    return getLaunchers()
  })
}

module.exports = {
  handleLauncherMessages,
}
