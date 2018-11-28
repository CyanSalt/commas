const {app, BrowserWindow, Menu, ipcMain, dialog} = require('electron')
const {resolve} = require('path')
const {format} = require('url')

const frames = []

function createWindow() {
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

function createApplicationMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: app.getName(),
      submenu: [
        {role: 'about'},
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
      label: 'Edit',
      submenu: [
        {role: 'copy'},
        {role: 'paste'},
        {role: 'selectall'},
      ],
    },
    {role: 'windowMenu'},
    {
      role: 'help',
      submenu: [{role: 'toggledevtools'}],
    },
  ])
  Menu.setApplicationMenu(menu)
}

function createWindowMenu(frame) {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Edit',
      submenu: [
        {role: 'copy'},
        {role: 'paste'},
        {role: 'selectall'},
      ],
    },
    {role: 'windowMenu'},
    {
      label: 'Help',
      submenu: [{role: 'toggledevtools'}],
    },
  ])
  frame.setMenu(menu)
  frame.setMenuBarVisibility(false)
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
  ipcMain.on('contextmenu', (event, args) => {
    Menu.buildFromTemplate(buildRendererMenu(event.sender, args)).popup({})
  })
  ipcMain.on('confirm', (event, args) => {
    const {sender} = event
    const window = frames.find(frame => frame.webContents === sender)
    dialog.showMessageBox(window, args, response => {
      sender.send('confirm', response)
    })
  })
}

function buildRendererMenu(contents, args) {
  if (Array.isArray(args)) {
    return args.map(item => buildRendererMenu(contents, item))
  }
  if (typeof args !== 'object') {
    return args
  }
  if (args.submenu) {
    args.submenu = buildRendererMenu(contents, args.submenu)
  }
  if (args.command) {
    args.click = () => {
      // Note: the second argument might be null on macOS
      contents.send('contextmenu', {
        command: args.command,
        data: args.data,
      })
    }
  }
  return args
}

app.on('ready', () => {
  if (process.platform === 'darwin') {
    createApplicationMenu()
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
