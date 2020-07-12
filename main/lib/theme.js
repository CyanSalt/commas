const { ipcMain } = require('electron')
const memoize = require('lodash/memoize')
const { resources, userData } = require('../utils/directory')
const { getSettings, getDefaultSettings, getSettingsEvents } = require('./settings')
const { broadcast } = require('./frame')

/**
 * @typedef {Record<string, string>} Theme
 */

/**
 * @type {Theme}
 */
const defaultTheme = resources.require('themes/oceanic-next.json')

async function loadTheme() {
  let originalTheme = defaultTheme
  const settings = await getSettings()
  const defaultSettings = getDefaultSettings()
  const name = settings['terminal.theme.name']
    || defaultSettings['terminal.theme.name']
  if (name !== defaultSettings['terminal.theme.name']) {
    const path = `themes/${name}.json`
    let source = await resources.load(path)
    if (!source) source = await userData.load(path)
    if (source) originalTheme = source
  }
  /** @type {Theme} */
  const theme = { ...originalTheme, name }
  return theme
}

const getTheme = memoize(() => {
  const events = getSettingsEvents()
  events.on('updated', () => {
    getTheme.cache.set(undefined, loadTheme())
    updateTheme()
  })
  return loadTheme()
})

async function updateTheme() {
  const theme = await getTheme()
  broadcast('theme-updated', theme)
}

function handleThemeMessages() {
  ipcMain.handle('get-theme', () => {
    return getTheme()
  })
}

module.exports = {
  handleThemeMessages,
}
