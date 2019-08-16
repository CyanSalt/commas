const {app, Menu} = require('electron')
const shared = require('../assets/menu')
const {FileStorage} = require('../build/main')
const {execCommand} = require('./command')
const {forEachWindow} = require('./frame')

function resolveBindingCommand(binding) {
  if (binding.command) {
    binding.click = (self, frame) => {
      execCommand(binding.command, frame)
    }
  }
  return binding
}

function getSharedWindowMenu() {
  return shared.map(resolveBindingCommand)
}

function getUserCustomMenu() {
  const keybindings = FileStorage.loadSync('keybindings.json') || []
  return keybindings.map(resolveBindingCommand)
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
            forEachWindow(window => window.reload())
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
            forEachWindow(window => window.reload())
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

module.exports = {
  createApplicationMenu,
  createWindowMenu,
  createDockMenu,
}
