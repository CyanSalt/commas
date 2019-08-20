const {app, BrowserWindow} = require('electron')
const {format} = require('url')
const {resolve} = require('path')
const {appDir} = require('../build/main')
const {hasWindow, getLastWindow, collectWindow} = require('./frame')
const {createWindowMenu} = require('./menu')
const {transferEvents} = require('./transfer')

function loadHTMLFile(frame, file) {
  frame.loadURL(format({
    protocol: 'file',
    slashes: true,
    pathname: resolve(appDir, file),
  }))
}

function createWindow(...args) {
  const options = {
    show: false,
    title: app.getName(),
    width: (8 * 80) + (2 * 8) + 180,
    minWidth: (8 * 40) + (2 * 8) + 180,
    height: (17 * 25) + (2 * 4) + 36,
    frame: false,
    titleBarStyle: 'hiddenInset',
    transparent: true,
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
  loadHTMLFile(frame, 'index.html')
  if (process.platform !== 'darwin') {
    createWindowMenu(frame)
  }
  // gracefully show window
  frame.once('ready-to-show', () => {
    frame.show()
  })
  // these handler must be binded in main process
  transferEvents(frame)
  // reference to avoid GC
  collectWindow(frame)
}

module.exports = {
  createWindow,
}
