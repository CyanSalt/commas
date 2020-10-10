const path = require('path')
const url = require('url')
const { app, BrowserWindow, ipcMain } = require('electron')
const { loadCustomCSS } = require('./addon')
const { hasWindow, getLastWindow, collectWindow, forEachWindow } = require('./frame')
const { createWindowMenu } = require('./menu')
const { handleEvents } = require('./message')

/**
 * @typedef BrowserWindowThemeOptions
 * @property {string} [backgroundColor]
 * @property {string} [vibrancy]
 */

/**
 * @type {BrowserWindowThemeOptions}
 */
let themeOptions = {
  /** {@link https://github.com/electron/electron/issues/10420} */
  backgroundColor: '#00000000',
  vibrancy: null,
}

/**
 * @param {BrowserWindowThemeOptions} options
 */
function setThemeOptions(options) {
  themeOptions = options
  forEachWindow(frame => {
    frame.setBackgroundColor(options.backgroundColor)
    frame.setVibrancy(options.vibrancy)
  })
}

/**
 * @param {BrowserWindow} frame
 * @param {string} file
 */
function loadHTMLFile(frame, file) {
  frame.loadURL(url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.resolve(__dirname, file),
  }))
}

/**
 * @param  {...string} args
 */
function createWindow(...args) {
  const options = {
    show: false,
    title: app.name,
    width: (8 * 80) + (2 * 8) + 180,
    minWidth: (8 * 40) + (2 * 8) + 180,
    height: (17 * 25) + (2 * 4) + 36,
    frame: false,
    // Similar to 'hiddenInset', but works well on fullscreen
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 12, y: 22 },
    transparent: true,
    ...themeOptions,
    acceptFirstMouse: true,
    affinity: 'default',
    webPreferences: {
      nodeIntegration: true,
      additionalArguments: [
        '--', ...args.filter(arg => arg !== undefined),
      ],
    },
  }
  // frame offset
  if (hasWindow()) {
    const rect = getLastWindow().getBounds()
    Object.assign(options, {
      x: rect.x + 30,
      y: rect.y + 30,
    })
  }
  const frame = new BrowserWindow(options)
  // Fix shadow issue on macOS
  if (process.platform === 'darwin') {
    frame.setSize(options.width - 1, options.height - 1)
    frame.setWindowButtonVisibility(false)
    frame.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        frame.setSize(options.width, options.height)
        frame.setWindowButtonVisibility(true)
      }, 500)
    })
  }
  loadHTMLFile(frame, '../../renderer/index.html')
  if (process.platform !== 'darwin') {
    createWindowMenu(frame)
  }
  // gracefully show window
  frame.once('ready-to-show', () => {
    frame.show()
  })
  // insert custom css
  loadCustomCSS(frame)
  // these handler must be bound in main process
  handleEvents(frame)
  // reference to avoid GC
  collectWindow(frame)
}

function handleWindowMessages() {
  ipcMain.handle('open-window', () => {
    createWindow()
  })
}

module.exports = {
  setThemeOptions,
  createWindow,
  handleWindowMessages,
}
