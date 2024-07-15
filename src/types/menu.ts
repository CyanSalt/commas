import type { MenuItemConstructorOptions } from 'electron'

export interface KeyBindingCommand {
  command?: string,
  args?: any[],
}

export interface MenuItem extends Partial<MenuItemConstructorOptions>, KeyBindingCommand {
  submenu?: MenuItem[],
}

export interface KeyBinding extends MenuItem {
  label: string,
  accelerator: string,
  when?: 'keydown' | 'keyup',
}
