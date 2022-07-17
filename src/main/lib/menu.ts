import { computed, unref } from '@vue/reactivity'
import { app, BrowserWindow, ipcMain, Menu, nativeImage, TouchBar } from 'electron'
import type { MenuItemConstructorOptions, PopupOptions } from 'electron'
import type { MenuItem } from '../../typings/menu'
import { resourceFile } from '../utils/directory'
import { globalHandler } from '../utils/handler'
import { useFocusedWindow } from './frame'
import { translate } from './i18n'
import { useAddonKeyBindings, useUserKeyBindings } from './keybinding'

const terminalKeyBindings: MenuItem[] = require(resourceFile('terminal.menu.json'))

const hasFocusedWindowRef = computed(() => Boolean(unref(useFocusedWindow())))

function resolveBindingCommand(binding: MenuItem) {
  const hasFocusedWindow = unref(hasFocusedWindowRef)
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
      result.enabled = hasFocusedWindow
    }
  }
  if (binding.submenu) {
    result.submenu = binding.submenu.map(resolveBindingCommand)
  }
  return result
}

const terminalMenuItemsRef = computed(() => {
  return terminalKeyBindings.map(resolveBindingCommand)
})

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

const menuTemplateRef = computed<MenuItemConstructorOptions[]>(() => {
  const terminalMenuItems = unref(terminalMenuItemsRef)
  const customMenuItems = unref(customMenuItemsRef)
  const addonMenuItems = unref(addonMenuItemsRef)
  return [
    {
      label: translate('Terminal#!menu.terminal'),
      submenu: terminalMenuItems,
    },
    { role: 'editMenu', label: translate('Edit#!menu.edit') },
    { role: 'windowMenu', label: translate('Window#!menu.window') },
    {
      label: translate('User#!menu.user'),
      submenu: customMenuItems,
    },
    {
      label: translate('Addon#!menu.addon'),
      submenu: addonMenuItems,
    },
    {
      label: translate('Help#!menu.help'),
      role: 'help',
      submenu: [
        { role: 'toggleDevTools', label: translate('Toggle Developer Tools#!menu.toggledevtools') },
        {
          label: translate('Relaunch %A#!menu.relaunch', { A: app.name }),
          accelerator: 'CmdOrCtrl+Shift+R',
          click() {
            app.relaunch()
          },
        },
      ],
    },
  ]
})

function createApplicationMenu() {
  const menuTemplate = unref(menuTemplateRef)
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
    ...menuTemplate,
  ])
  Menu.setApplicationMenu(menu)
}

function createWindowMenu(frame: BrowserWindow) {
  const menuTemplate = unref(menuTemplateRef)
  const menu = Menu.buildFromTemplate([
    ...menuTemplate,
  ])
  frame.setMenu(menu)
}

function createTouchBar(frame: BrowserWindow) {
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
  ipcMain.handle('contextmenu', (event, template: MenuItem[], options: PopupOptions) => {
    const frame = BrowserWindow.fromWebContents(event.sender)
    const menu = Menu.buildFromTemplate(
      template.map(resolveBindingCommand),
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
