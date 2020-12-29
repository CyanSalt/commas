const { app, Menu, ipcMain, BrowserWindow } = require('electron')
const memoize = require('lodash/memoize')
const { resources } = require('../utils/directory')
const { translate } = require('./i18n')
const { getUserKeyBindings, getAddonKeyBindings } = require('./keybinding')

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
  const result = { ...binding }
  if (binding.label) {
    result.label = translate(binding.label)
  }
  if (binding.command) {
    result.click = (self, frame) => {
      frame.webContents.send(result.command, result.args)
    }
  }
  if (binding.submenu) {
    binding.submenu = binding.submenu.map(resolveBindingCommand)
  }
  return result
}

function getShellMenuItems() {
  return shellMenuItems.map(resolveBindingCommand)
}

const getCustomMenuItems = memoize(async () => {
  /** @type {MenuItemConstructorOptions[]} */
  const keybindings = await getUserKeyBindings()
  return keybindings
    .filter(item => item.command && !item.command.startsWith('xterm:'))
    .map(resolveBindingCommand)
})

const getAddonMenuItems = memoize(async () => {
  /** @type {MenuItemConstructorOptions[]} */
  const keybindings = await getAddonKeyBindings()
  return keybindings
    .filter(item => item.command && !item.command.startsWith('xterm:'))
    .map(resolveBindingCommand)
})

async function createApplicationMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about', label: translate('About %A#!menu.about', { A: app.name }) },
        { type: 'separator' },
        {
          label: translate('Preferences...#!menu.preference'),
          accelerator: 'Command+,',
          click(self, frame) {
            frame.webContents.send('invoke', 'open-settings')
          },
        },
        { type: 'separator' },
        { role: 'services', label: translate('Services#!menu.services') },
        { type: 'separator' },
        { role: 'hide', label: translate('Hide %A#!menu.hide', { A: app.name }) },
        { role: 'hideothers', label: translate('Hide Others#!menu.hideothers') },
        { role: 'unhide', label: translate('Show All#!menu.unhide') },
        { type: 'separator' },
        { role: 'quit', label: translate('Quit %A#!menu.quit', { A: app.name }) },
      ],
    },
    {
      label: translate('Shell#!menu.shell'),
      submenu: getShellMenuItems(),
    },
    { role: 'editMenu', label: translate('Edit#!menu.edit') },
    { role: 'windowMenu', label: translate('Window#!menu.window') },
    {
      label: translate('User#!menu.user'),
      submenu: await getCustomMenuItems(),
    },
    {
      label: translate('Addon#!menu.addon'),
      submenu: await getAddonMenuItems(),
    },
    {
      label: translate('Help#!menu.help'),
      role: 'help',
      submenu: [
        { role: 'toggledevtools', label: translate('Toggle Developer Tools#!toggledevtools') },
        {
          label: translate('Relaunch %A#!menu.relaunch', { A: app.name }),
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
      label: translate('Shell#!menu.shell'),
      submenu: getShellMenuItems(),
    },
    { role: 'editMenu' },
    { role: 'windowMenu' },
    {
      label: translate('User#!menu.user'),
      submenu: await getCustomMenuItems(),
    },
    {
      label: translate('Addon#!menu.addon'),
      submenu: await getAddonMenuItems(),
    },
    {
      label: translate('Help#!menu.help'),
      submenu: [
        { role: 'toggledevtools' },
        {
          label: translate('Relaunch %A#!menu.relaunch', { A: app.name }),
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
      label: translate('New Window#!menu.newwindow'),
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
