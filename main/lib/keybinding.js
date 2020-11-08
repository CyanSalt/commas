const { ipcMain } = require('electron')
const memoize = require('lodash/memoize')
const { userData } = require('../utils/directory')

/**
 * @typedef {import('electron').MenuItemConstructorOptions} MenuItemConstructorOptions
 */

function loadKeyBindings() {
  return userData.load('keybindings.json') || []
}

const getUserKeyBindings = memoize(() => {
  return loadKeyBindings()
})

/** @type {MenuItemConstructorOptions[]} */
const addonKeyBindings = []

function getAddonKeyBindings() {
  return addonKeyBindings
}

/**
 * @param {MenuItemConstructorOptions} item
 */
function addKeyBinding(item) {
  addonKeyBindings.push(item)
}

async function getKeyBindings() {
  const userKeyBindings = await getUserKeyBindings()
  return [
    ...userKeyBindings,
    ...addonKeyBindings,
  ]
}

function handleKeyBindingMessages() {
  ipcMain.handle('get-keybindings', () => {
    return getKeyBindings()
  })
}

module.exports = {
  getKeyBindings,
  getUserKeyBindings,
  getAddonKeyBindings,
  addKeyBinding,
  handleKeyBindingMessages,
}
