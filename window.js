const {app, BrowserWindow, Menu, ipcMain, dialog, autoUpdater} = require('electron')
const {translate, FileStorage} = require('./src/build/helper')
const path = require('path')
const url = require('url')

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
      nodeIntegration: true,
    },
  }
  // frame offset
  if (frames.length) {
    const rect = frames[frames.length - 1].getBounds()
    Object.assign(options, {
      x: rect.x + 30,
      y: rect.y + 30,
    })
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
  // additional arguments for renderer
  if (args) {
    frame.additionalArguments = args
  }
}

function loadHTMLFile(frame, file) {
  frame.loadURL(url.format({
    protocol: 'file',
    slashes: true,
    pathname: path.resolve(__dirname, file),
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

function execCommand(command, frame) {
  if (!frame) {
    frame = BrowserWindow.getFocusedWindow() || frames[frames.length - 1]
    if (!frame) return
  }
  frame.webContents.send('command', command)
}

function getSharedWindowMenu() {
  return [
    {
      label: 'New Tab',
      accelerator: 'CmdOrCtrl+T',
      click(self, frame) {
        execCommand('open-tab', frame)
      },
    },
    {
      label: 'New Window',
      accelerator: 'CmdOrCtrl+N',
      click(self, frame) {
        execCommand('open-window', frame)
      },
    },
    {type: 'separator'},
    {
      label: 'Select Previous Tab',
      accelerator: 'CmdOrCtrl+Shift+[',
      click(self, frame) {
        execCommand('previous-tab', frame)
      },
    },
    {
      label: 'Select Next Tab',
      accelerator: 'CmdOrCtrl+Shift+]',
      click(self, frame) {
        execCommand('next-tab', frame)
      },
    },
    {type: 'separator'},
    {
      label: 'Find',
      accelerator: 'CmdOrCtrl+F',
      click(self, frame) {
        execCommand('find', frame)
      },
    },
    {
      label: 'Clear',
      accelerator: 'CmdOrCtrl+K',
      click(self, frame) {
        execCommand('clear', frame)
      },
    },
    {type: 'separator'},
    {
      label: 'Close Tab',
      accelerator: 'CmdOrCtrl+W',
      click(self, frame) {
        execCommand('close-tab', frame)
      },
    },
    {
      label: 'Close Window',
      accelerator: 'CmdOrCtrl+Shift+W',
      click(self, frame) {
        execCommand('close-window', frame)
      },
    },
  ]
}

function getUserCustomMenu() {
  const keybindings = FileStorage.loadSync('keybindings.json') || []
  return keybindings.map(item => {
    item.click = (self, frame) => {
      execCommand(item.command, frame)
    }
    return item
  })
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
          click(self, frame) {
            execCommand('interact-settings', frame)
          },
        },
        {type: 'separator'},
        {role: 'services'},
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
        {
          label: 'Reload All Windows',
          accelerator: 'CmdOrCtrl+Shift+R',
          click() {
            frames.forEach(window => window.reload())
          },
        },
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
        {
          label: 'Reload All Windows',
          accelerator: 'CmdOrCtrl+Shift+R',
          click() {
            frames.forEach(window => window.reload())
          },
        },
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
      click(self, frame) {
        execCommand('open-window', frame)
      },
    },
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
  app.on('before-quit', () => {
    frames.forEach(frame => frame.webContents.send('before-quit'))
  })
  ipcMain.on('open-window', () => {
    createWindow()
  })
}

let autoUpdateChecker
function checkForUpdates() {
  if (!app.isPackaged || !['darwin', 'win32'].includes(process.platform)) return
  autoUpdater.on('update-available', () => {
    clearInterval(autoUpdateChecker)
  })
  autoUpdater.on('update-downloaded', (event, notes, name) => {
    const options = {
      message: name,
      detail: translate('A new version has been downloaded. Restart the application to apply the updates.#!16'),
      buttons: [
        translate('Restart#!17'),
        translate('Later#!18'),
      ],
      defaultId: 0,
      cancelId: 1,
    }
    // const {response} = await dialog.showMessageBox(options)
    // if (response === 0) autoUpdater.quitAndInstall()
    dialog.showMessageBox(options, response => {
      if (response === 0) autoUpdater.quitAndInstall()
    })
  })
  // Electron official feed URL
  const repo = 'CyanSalt/commas'
  const host = 'https://update.electronjs.org'
  const feedURL = `${host}/${repo}/${process.platform}-${process.arch}/${app.getVersion()}`
  autoUpdater.setFeedURL(feedURL)
  // Check for updates endlessly
  autoUpdateChecker = setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 3600 * 1e3)
  autoUpdater.checkForUpdates()
}

let cwd
app.on('ready', () => {
  if (process.platform === 'darwin') {
    createApplicationMenu()
    createDockMenu()
  }
  transferInvoking()
  createWindow(cwd && {path: cwd})
  checkForUpdates()
})

app.on('activate', () => {
  if (!frames.length && app.isReady()) {
    createWindow()
  }
})

app.on('will-finish-launching', () => {
  // handle opening outside
  app.on('open-file', (event, file) => {
    event.preventDefault()
    // for Windows
    if (!file) {
      file = process.argv[process.argv.length - 1]
    }
    if (!app.isReady()) {
      cwd = file
    } else if (frames.length) {
      const last = frames[frames.length - 1]
      last.webContents.send('open-path', file)
    } else {
      createWindow({path: file})
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
