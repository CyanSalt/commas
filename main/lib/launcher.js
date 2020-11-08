const { ipcMain } = require('electron')
const memoize = require('lodash/memoize')
const { userData } = require('../utils/directory')
const { createIDGenerator } = require('../utils/helper')
const { broadcast } = require('./frame')

const generateID = createIDGenerator()

/**
 * @param {any[]} launchers
 * @param {any[]} [oldValues]
 */
function fillLauncherIDs(launchers, oldValues) {
  oldValues = oldValues ? [...oldValues] : []
  return launchers.map(launcher => {
    const index = oldValues.findIndex(item => {
      return item.name === launcher.name || item.remote === launcher.remote
        && item.directory === launcher.directory
        && item.command === launcher.command
    })
    let matched
    if (index !== -1) {
      matched = oldValues[index]
      oldValues.splice(index, 1)
    }
    return {
      ...launcher,
      id: matched ? matched.id : generateID(),
    }
  })
}

const getRawLaunchers = memoize(() => {
  userData.watch('launchers.json', async () => {
    getRawLaunchers.cache.set(undefined, loadLaunchers())
    updateLaunchers()
  })
  return loadLaunchers()
})

async function loadLaunchers() {
  const cache = await getRawLaunchers.cache.get()
  const result = await userData.fetch('launchers.json')
  if (result && result.data) {
    result.data = fillLauncherIDs(result.data, cache && cache.data)
  }
  return result
}

async function getLaunchers() {
  const result = await getRawLaunchers()
  return result && result.data || []
}

async function updateLaunchers() {
  const launchers = await getLaunchers()
  broadcast('launchers-updated', launchers)
}

function handleLauncherMessages() {
  ipcMain.handle('get-launchers', () => {
    return getLaunchers()
  })
  ipcMain.handle('set-launchers', async (event, launchers) => {
    const result = await getRawLaunchers()
    return userData.update('launchers.json', {
      data: launchers.map(({ id, ...launcher }) => launcher),
      writer: result && result.writer,
    })
  })
}

module.exports = {
  handleLauncherMessages,
}
