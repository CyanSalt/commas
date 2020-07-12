const { app, Menu, ipcMain, BrowserWindow } = require('electron')
const memoize = require('lodash/memoize')
const { resources, userData } = require('../utils/directory')

/**
 * @typedef {import('electron').MenuItemConstructorOptions} MenuItemConstructorOptions
 */

/**
 * @type {MenuItemConstructorOptions[]}
 */
const shellMenuItems = resources.require('shell.menu.json')

/**
 * @param {MenuItemConstructorOptions} binding
 */
function resolveBindingCommand(binding) {
  if (binding.command) {
    binding.click = (self, frame) => {
      frame.webContents.send(binding.command, binding.args)
    }
  }
  return binding
}

function getShellMenuItems() {
  return shellMenuItems.map(resolveBindingCommand)
}

const getCustomMenuItems = memoize(async () => {
  /** @type {MenuItemConstructorOptions[]} */
  const keybindings = await userData.load('keybindings.json') || []
  return keybindings.map(resolveBindingCommand)
})

async function createApplicationMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Preferences...',
          accelerator: 'Command+,',
          click(self, frame) {
            frame.webContents.send('open-settings')
          },
        },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Shell',
      submenu: getShellMenuItems(),
    },
    { role: 'editMenu' },
    { role: 'windowMenu' },
    {
      label: 'User',
      submenu: await getCustomMenuItems(),
    },
    {
      role: 'help',
      submenu: [
        { role: 'toggledevtools' },
        {
          label: 'Relaunch App',
          accelerator: 'CmdOrCtrl+Shift+R',
          click() {
            app.relaunch()
          },
        },
      ],
    },
  ])
  Menu.setApplicationMenu(menu)
}

/**
 * @param {BrowserWindow} frame
 */
async function createWindowMenu(frame) {
  const menu = Menu.buildFromTemplate([
    {
      label: 'Shell',
      submenu: getShellMenuItems(),
    },
    { role: 'editMenu' },
    { role: 'windowMenu' },
    {
      label: 'User',
      submenu: await getCustomMenuItems(),
    },
    {
      label: 'Help',
      submenu: [
        { role: 'toggledevtools' },
        {
          label: 'Relaunch App',
          accelerator: 'CmdOrCtrl+Shift+R',
          click() {
            app.relaunch()
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
        frame.webContents.send('open-window')
      },
    },
  ])
  app.dock.setMenu(menu)
}

function handleMenuMessages() {
  ipcMain.handle('contextmenu', (event, template, position) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    const menu = Menu.buildFromTemplate(
      template.map(resolveBindingCommand)
    )
    menu.popup({
      window: frame,
      x: position.x,
      y: position.y,
    })
  })
}

module.exports = {
  createApplicationMenu,
  createWindowMenu,
  createDockMenu,
  handleMenuMessages,
}
