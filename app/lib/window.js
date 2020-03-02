const {app, BrowserWindow} = require('electron')
const {format} = require('url')
const {resolve} = require('path')
const {hasWindow, getLastWindow, collectWindow} = require('./frame')
const {createWindowMenu} = require('./menu')
const {transferEvents} = require('./transfer')

function loadHTMLFile(frame, file) {
  frame.loadURL(format({
    protocol: 'file',
    slashes: true,
    pathname: resolve(__dirname, file),
  }))
}

function createWindow(...args) {
  const options = {
    show: false,
    title: app.name,
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
  // Fix shadow issue on macOS
  if (process.platform === 'darwin') {
    frame.setSize(options.width - 1, options.height - 1)
    frame.webContents.once('did-finish-load', () => {
      setTimeout(() => {
        frame.setSize(options.width, options.height)
      }, 500)
    })
  }
  loadHTMLFile(frame, '../../src/index.html')
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
