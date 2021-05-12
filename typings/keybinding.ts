import type { MenuItemConstructorOptions } from 'electron'

export interface KeyBinding extends Partial<MenuItemConstructorOptions> {
  label: string,
  accelerator: string,
  when?: 'keydown' | 'keyup',
  command?: string,
  args?: any[],
  submenu?: KeyBinding[],
}
