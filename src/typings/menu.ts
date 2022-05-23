import type { MenuItemConstructorOptions } from 'electron'

export interface MenuItem extends Partial<MenuItemConstructorOptions> {
  command?: string,
  args?: any[],
  submenu?: MenuItem[],
}

export interface KeyBinding extends MenuItem {
  label: string,
  accelerator: string,
  when?: 'keydown' | 'keyup',
}
