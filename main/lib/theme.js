const { ipcMain, nativeTheme } = require('electron')
const memoize = require('lodash/memoize')
const { resources, userData } = require('../utils/directory')
const { toRGBA, toCSSColor, toElectronColor, isDarkColor, mix } = require('../utils/color')
const { getSettings, getDefaultSettings, getSettingsEvents } = require('./settings')
const { broadcast } = require('./frame')
const { setThemeOptions } = require('./window')

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
  theme.opacity = opacity
  theme.background = toCSSColor({ ...backgroundRGBA, a: 1 })
  theme.backdrop = opacity < 1 ? toCSSColor({
    ...backgroundRGBA,
    a: opacity,
  }) : theme.background
  if (!theme.selection || toRGBA(theme.selection).a < 1) {
    theme.selection = toCSSColor(mix(toRGBA(theme.foreground), backgroundRGBA, 0.5))
  }
  if (!theme.cursor) {
    theme.cursor = theme.foreground
  }
  if (!theme.cursorAccent) {
    theme.cursorAccent = theme.background
  }
  setThemeOptions({
    backgroundColor: toElectronColor({ ...backgroundRGBA, a: 0 }),
    vibrancy: opacity === 0 ? 'tooltip' : null,
  })
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
