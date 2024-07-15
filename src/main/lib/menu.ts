import type { MenuItemConstructorOptions, PopupOptions } from 'electron'
import { app, BrowserWindow, globalShortcut, Menu, nativeImage, TouchBar } from 'electron'
import { ipcMain } from '@commas/electron-ipc'
import type { TranslationVariables } from '@commas/types/i18n'
import type { KeyBinding, MenuItem } from '@commas/types/menu'
import { globalHandler } from '../../shared/handler'
import { provideIPC, useYAMLFile } from '../utils/compositions'
import { resourceFile, userFile } from '../utils/directory'
import { execa } from '../utils/helper'
import { send, useFocusedWindow } from './frame'
import { translate } from './i18n'
import { useSettings } from './settings'
import { openFile } from './window'

declare module '@commas/electron-ipc' {
  export interface Commands {
    contextmenu: (template: MenuItem[], options: PopupOptions) => void,
  }
  export interface Refs {
    keybindings: typeof keyBindings,
  }
}

const userKeyBindings = $(useYAMLFile<KeyBinding[]>(userFile('keybindings.yaml'), []))
const addonKeyBindings = $ref<KeyBinding[]>([])

function useAddonKeyBindings() {
  return $$(addonKeyBindings)
}

const keyBindings = $computed(() => {
  return [
    ...userKeyBindings,
    ...addonKeyBindings,
  ]
})

const terminalKeyBindings: MenuItem[] = require(resourceFile('terminal.menu.json'))

const focusedWindow = $(useFocusedWindow())
const hasFocusedWindow = $computed(() => Boolean(focusedWindow))

function resolveBindingCommand(binding: MenuItem) {
  const result: MenuItemConstructorOptions = { ...binding }
  if (binding.label) {
    result.label = translate(binding.label, binding.args as unknown as TranslationVariables | undefined)
  }
  if (binding.command) {
    if (binding.command.startsWith('global-main:')) {
      result.click = (self, frame) => {
        globalHandler.invoke(binding.command as never, ...(binding.args ?? []) as never, frame)
      }
    } else {
      result.click = (self, frame) => {
        if (frame) {
          send(frame.webContents, binding.command as never, ...(binding.args ?? []) as never)
        }
      }
      result.enabled = hasFocusedWindow
    }
  }
  if (binding.submenu) {
    result.submenu = binding.submenu.map(resolveBindingCommand)
  }
  return result
}

const terminalMenuItems = $computed(() => {
  return terminalKeyBindings.map(resolveBindingCommand)
})

const customMenuItems = $computed(() => {
  return userKeyBindings
    .filter(item => item.command && !item.command.startsWith('xterm:'))
    .map(resolveBindingCommand)
})

const addonMenuItems = $computed(() => {
  return addonKeyBindings
    .filter(item => item.command && !item.command.startsWith('xterm:'))
    .map(resolveBindingCommand)
})

const menuTemplate = $computed<MenuItemConstructorOptions[]>(() => {
  return [
    {
      label: translate('Terminal#!menu.terminal'),
      submenu: terminalMenuItems,
    },
    {
      label: translate('Edit#!menu.edit'),
      role: 'editMenu',
    },
    {
      label: translate('Window#!menu.window'),
      role: 'windowMenu',
    },
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
        {
          label: translate('Toggle Developer Tools#!menu.toggledevtools'),
          role: 'toggleDevTools',
        },
        {
          label: translate('Relaunch ${name}#!menu.relaunch', { name: app.name }),
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
  const menu = Menu.buildFromTemplate([
    {
      label: app.name,
      submenu: [
        { role: 'about', label: translate('About ${name}#!menu.about', { name: app.name }) },
        { type: 'separator' },
        {
          label: translate('Preferences...#!menu.preference'),
          accelerator: 'Command+,',
          click() {
            globalHandler.invoke('global-main:open-settings')
          },
        },
        { type: 'separator' },
        { role: 'services', label: translate('Services#!menu.services') },
        { type: 'separator' },
        { role: 'hide', label: translate('Hide ${name}#!menu.hide', { name: app.name }) },
        { role: 'hideOthers', label: translate('Hide Others#!menu.hideothers') },
        { role: 'unhide', label: translate('Show All#!menu.unhide') },
        { type: 'separator' },
        { role: 'quit', label: translate('Quit ${name}#!menu.quit', { name: app.name }) },
      ],
    },
    ...menuTemplate,
  ])
  Menu.setApplicationMenu(menu)
}

function createWindowMenu(frame: BrowserWindow) {
  const menu = Menu.buildFromTemplate([
    ...menuTemplate,
  ])
  frame.setMenu(menu)
}

function createTouchBar(frame: BrowserWindow) {
  const settings = useSettings()
  const position = settings['terminal.view.tabListPosition']
  const isHorizontal = position === 'top' || position === 'bottom'
  const menu = [
    { icon: 'NSImageNameTouchBarListViewTemplate', command: 'show-tab-options' } as const,
    ...(isHorizontal ? [] : [
      { icon: 'NSImageNameTouchBarSidebarTemplate', command: 'toggle-tab-list' } as const,
    ]),
    { icon: 'NSImageNameTouchBarAddTemplate', command: 'open-tab' } as const,
  ]
  const { TouchBarButton } = TouchBar
  const touchBar = new TouchBar({
    items: menu.map(item => new TouchBarButton({
      icon: nativeImage.createFromNamedImage(item.icon, [-1, 0, 1]).resize({ height: 16 }),
      click() {
        send(frame.webContents, item.command)
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
        globalHandler.invoke('global-main:open-window')
      },
    },
  ])
  app.dock.setMenu(menu)
}

function registerGlobalShortcuts() {
  if (process.platform === 'darwin') {
    globalShortcut.register('CmdOrCtrl+Alt+T', async () => {
      const { stdout: frontmost } = await execa(`osascript -e 'tell application "System Events" to get name of application processes whose frontmost is true and visible is true'`)
      if (frontmost.trim() === 'Finder') {
        const { stdout } = await execa(`osascript -e 'tell application "Finder" to get the POSIX path of (target of front window as alias)'`)
        openFile(stdout.trim())
      }
    })
  }
}

function handleMenuMessages() {
  provideIPC('keybindings', $$(keyBindings))
  ipcMain.handle('contextmenu', (event, template, options) => {
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
  useAddonKeyBindings,
  createApplicationMenu,
  createWindowMenu,
  createDockMenu,
  createTouchBar,
  registerGlobalShortcuts,
  handleMenuMessages,
}
