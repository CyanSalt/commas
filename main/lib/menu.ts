import { computed, unref } from '@vue/reactivity'
import { app, BrowserWindow, ipcMain, Menu, nativeImage, TouchBar } from 'electron'
import type { MenuItemConstructorOptions, PopupOptions } from 'electron'
import type { KeyBinding } from '../../typings/keybinding'
import { resources } from '../utils/directory'
import { globalHandler } from '../utils/handler'
import { useFocusedWindow } from './frame'
import { translate } from './i18n'
import { useAddonKeyBindings, useUserKeyBindings } from './keybinding'

const terminalMenuItems = resources.require<KeyBinding[]>('terminal.menu.json')!

function resolveBindingCommand(binding: KeyBinding) {
  const focusedWindow = unref(useFocusedWindow())
  const result: MenuItemConstructorOptions = { ...binding }
  if (binding.label) {
    result.label = translate(binding.label)
  }
  if (binding.command) {
    if (binding.command.startsWith('global:')) {
      result.click = () => {
        globalHandler.invoke(binding.command!, ...(binding.args ?? []))
      }
    } else {
      result.click = (self, frame) => {
        frame?.webContents.send(binding.command!, ...(binding.args ?? []))
      }
      result.enabled = Boolean(focusedWindow)
    }
  }
  if (binding.submenu) {
    result.submenu = binding.submenu.map(resolveBindingCommand)
  }
  return result
}

function getTerminalMenuItems() {
  return terminalMenuItems.map(resolveBindingCommand)
}

const customMenuItemsRef = computed(() => {
  const userKeyBindings = unref(useUserKeyBindings())
  return userKeyBindings
    .filter(item => item.command && !item.command.startsWith('xterm:'))
    .map(resolveBindingCommand)
})

const addonMenuItemsRef = computed(() => {
  const addonKeyBindings = unref(useAddonKeyBindings())
  return addonKeyBindings
    .filter(item => item.command && !item.command.startsWith('xterm:'))
    .map(resolveBindingCommand)
})

async function createApplicationMenu() {
  const loadingCustomMenuItems = unref(customMenuItemsRef)
  const loadingAddonMenuItems = unref(addonMenuItemsRef)
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about', label: translate('About %A#!menu.about', { A: app.name }) },
        { type: 'separator' },
        {
          label: translate('Preferences...#!menu.preference'),
          accelerator: 'Command+,',
          click() {
            globalHandler.invoke('global:open-settings')
          },
        },
        { type: 'separator' },
        { role: 'services', label: translate('Services#!menu.services') },
        { type: 'separator' },
        { role: 'hide', label: translate('Hide %A#!menu.hide', { A: app.name }) },
        { role: 'hideOthers', label: translate('Hide Others#!menu.hideothers') },
        { role: 'unhide', label: translate('Show All#!menu.unhide') },
        { type: 'separator' },
        { role: 'quit', label: translate('Quit %A#!menu.quit', { A: app.name }) },
      ],
    },
    {
      label: translate('Terminal#!menu.terminal'),
      submenu: getTerminalMenuItems(),
    },
    { role: 'editMenu', label: translate('Edit#!menu.edit') },
    { role: 'windowMenu', label: translate('Window#!menu.window') },
    {
      label: translate('User#!menu.user'),
      submenu: await loadingCustomMenuItems,
    },
    {
      label: translate('Addon#!menu.addon'),
      submenu: await loadingAddonMenuItems,
    },
    {
      label: translate('Help#!menu.help'),
      role: 'help',
      submenu: [
        { role: 'toggleDevTools', label: translate('Toggle Developer Tools#!toggledevtools') },
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

async function createWindowMenu(frame: BrowserWindow) {
  const loadingCustomMenuItems = unref(customMenuItemsRef)
  const loadingAddonMenuItems = unref(addonMenuItemsRef)
  const menu = Menu.buildFromTemplate([
    {
      label: translate('Terminal#!menu.terminal'),
      submenu: getTerminalMenuItems(),
    },
    { role: 'editMenu' },
    { role: 'windowMenu' },
    {
      label: translate('User#!menu.user'),
      submenu: await loadingCustomMenuItems,
    },
    {
      label: translate('Addon#!menu.addon'),
      submenu: await loadingAddonMenuItems,
    },
    {
      label: translate('Help#!menu.help'),
      submenu: [
        { role: 'toggleDevTools' },
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

async function createTouchBar(frame: BrowserWindow) {
  const menu = [
    { icon: 'NSImageNameTouchBarListViewTemplate', command: 'show-tab-options' },
    { icon: 'NSImageNameTouchBarSidebarTemplate', command: 'toggle-tab-list' },
    { icon: 'NSImageNameTouchBarAddTemplate', command: 'open-tab' },
  ]
  const { TouchBarButton } = TouchBar
  const touchBar = new TouchBar({
    items: menu.map(item => new TouchBarButton({
      icon: nativeImage.createFromNamedImage(item.icon, [-1, 0, 1]).resize({ height: 16 }),
      click() {
        frame.webContents.send(item.command)
      },
    })),
  })
  frame.setTouchBar(touchBar)
}

function createDockMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: translate('New Window#!menu.newwindow'),
      accelerator: 'CmdOrCtrl+N',
      click() {
        globalHandler.invoke('global:open-window')
      },
    },
  ])
  app.dock.setMenu(menu)
}

function handleMenuMessages() {
  ipcMain.handle('contextmenu', (event, template: KeyBinding[], options: PopupOptions) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    const menu = Menu.buildFromTemplate(
      template.map(resolveBindingCommand)
    )
    menu.popup({
      ...options,
      window: frame ?? undefined,
    })
  })
}

export {
  createApplicationMenu,
  createWindowMenu,
  createDockMenu,
  createTouchBar,
  handleMenuMessages,
}
