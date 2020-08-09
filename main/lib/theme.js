const { ipcMain, nativeTheme } = require('electron')
const memoize = require('lodash/memoize')
const { resources, userData } = require('../utils/directory')
const { toRGBA, toCSSColor, isDarkColor, mix } = require('../utils/color')
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
  const customization = settings['terminal.theme.customization']
  /** @type {Theme} */
  const theme = {
    ...originalTheme,
    ...customization,
    name,
  }
  const opacity = settings['terminal.style.opacity']
  const backgroundRGBA = toRGBA(theme.background)
  const isDark = isDarkColor(backgroundRGBA)
  theme.type = isDark ? 'dark' : 'light'
  theme.background = toCSSColor({ ...backgroundRGBA, a: 1 })
  theme.backdrop = opacity < 1 && opacity > 0 ? toCSSColor({
    ...backgroundRGBA,
    a: opacity,
  }) : theme.background
  if (!theme.selection || toRGBA(theme.selection).a < 1) {
    const weight = isDark ? 0.3 : 0.15
    theme.selection = toCSSColor(mix(toRGBA(theme.foreground), backgroundRGBA, weight))
  }
  if (!theme.cursor) {
    theme.cursor = theme.foreground
  }
  if (!theme.cursorAccent) {
    theme.cursorAccent = theme.background
  }
  // Enable system dark mode
  nativeTheme.themeSource = theme.type
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
