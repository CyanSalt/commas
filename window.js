const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron')
const {resolve} = require('path')
const {format} = require('url')
const {readFileSync} = require('fs')
const {parse} = require('json5')

const frames = []

function createWindow(args) {
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
      experimentalFeatures: true,
    },
    ...args,
  }
  const frame = new BrowserWindow(options)
  loadHTMLFile(frame, 'src/index.html')
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

function loadHTMLFile(frame, path) {
  frame.loadURL(format({
    protocol: 'file',
    slashes: true,
    pathname: resolve(__dirname, path)
  }))
}

function collectWindow(frame) {
  frames.push(frame)
  frame.on('closed', () => {
    const index = frames.indexOf(frame)
    if (index !== -1) {
      frames.splice(index, 1)
    }
  })
}

function execCommand(command) {
  let frame = BrowserWindow.getFocusedWindow()
  if (!frame) frame = frames[frames.length - 1]
  frame && frame.webContents.send('command', command)
}

// eslint-disable-next-line max-lines-per-function
function getSharedWindowMenu() {
  return [
    {
      label: 'New Tab',
      accelerator: 'CmdOrCtrl+T',
      click() {
        execCommand('open-tab')
      }
    },
    {
      label: 'New Window',
      accelerator: 'CmdOrCtrl+N',
      click() {
        execCommand('open-window')
      }
    },
    {type: 'separator'},
    {
      label: 'Select Previous Tab',
      accelerator: 'CmdOrCtrl+Shift+[',
      click() {
        execCommand('previous-tab')
      }
    },
    {
      label: 'Select Next Tab',
      accelerator: 'CmdOrCtrl+Shift+]',
      click() {
        execCommand('next-tab')
      }
    },
    {type: 'separator'},
    {
      label: 'Close Tab',
      accelerator: 'CmdOrCtrl+W',
      click() {
        execCommand('close-tab')
      }
    },
    {
      label: 'Close Window',
      accelerator: 'CmdOrCtrl+Shift+W',
      click() {
        execCommand('close-window')
      }
    },
  ]
}

function getUserCustomMenu() {
  const userdata = app.isPackaged ?
    app.getPath('userData') : resolve(__dirname, 'userdata')
  const path = resolve(userdata, 'keybindings.json')
  try {
    const keybindings = parse(readFileSync(path))
    return keybindings.map(item => {
      item.click = () => {
        execCommand(item.command)
      }
      return item
    })
  } catch (e) {
    return []
  }
}

function createApplicationMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: app.getName(),
      submenu: [
        {role: 'about'},
        {type: 'separator'},
        {
          label: 'Preferences...',
          accelerator: 'Command+,',
          click() {
            execCommand('open-settings')
          }
        },
        {type: 'separator'},
        {role: 'services', submenu: []},
        {type: 'separator'},
        {role: 'hide'},
        {role: 'hideothers'},
        {role: 'unhide'},
        {type: 'separator'},
        {role: 'quit'},
      ],
    },
    {
      label: 'Shell',
      submenu: getSharedWindowMenu(),
    },
    {role: 'editMenu'},
    {role: 'windowMenu'},
    {
      label: 'User',
      submenu: getUserCustomMenu(),
    },
    {
      role: 'help',
      submenu: [
        {role: 'toggledevtools'},
      ],
    },
  ])
  Menu.setApplicationMenu(menu)
}

function createWindowMenu(frame) {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Shell',
      submenu: getSharedWindowMenu(),
    },
    {role: 'editMenu'},
    {role: 'windowMenu'},
    {
      label: 'User',
      submenu: getUserCustomMenu(),
    },
    {
      label: 'Help',
      submenu: [
        {role: 'toggledevtools'},
      ],
    },
  ])
  frame.setMenu(menu)
  frame.setMenuBarVisibility(false)
}

function createDockMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: 'New Window',
      accelerator: 'CmdOrCtrl+N',
      click() {
        execCommand('open-window')
      }
    }
  ])
  app.dock.setMenu(menu)
}

function transferEvents(frame) {
  frame.on('maximize', () => {
    frame.webContents.send('maximize')
  })
  frame.on('unmaximize', () => {
    frame.webContents.send('unmaximize')
  })
  frame.on('enter-full-screen', () => {
    frame.webContents.send('enter-full-screen')
  })
  frame.on('leave-full-screen', () => {
    frame.webContents.send('leave-full-screen')
  })
}

function transferInvoking() {
  ipcMain.on('confirm', (event, args) => {
    const {sender} = event
    const window = frames.find(frame => frame.webContents === sender)
    dialog.showMessageBox(window, args, response => {
      sender.send('confirm', response)
    })
  })
  ipcMain.on('open-window', event => {
    const {sender} = event
    const parent = frames.find(frame => frame.webContents === sender)
    const rect = parent.getBounds()
    createWindow({x: rect.x + 30, y: rect.y + 30})
  })
}

app.on('ready', () => {
  if (process.platform === 'darwin') {
    createApplicationMenu()
    createDockMenu()
  }
  transferInvoking()
  createWindow()
})

app.on('activate', () => {
  if (!frames.length && app.isReady()) {
    createWindow()
  }
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
