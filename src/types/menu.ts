import type { GlobalCommands, RendererEvents } from '@commas/electron-ipc'
import type { BrowserWindow, KeyboardEvent, MenuItemConstructorOptions } from 'electron'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface XtermEvents {}

type ValueOf<T> = T[keyof T]

type OptionalArgs<T extends { args: unknown[] }> = [] extends T['args'] ? Omit<T, 'args'> & Partial<Pick<T, 'args'>> : T

type OmitArgs<T extends unknown[], U extends unknown[]> = T extends [...infer V, ...U] ? V : T

export type KeyBindingCommand = ValueOf<{
  [K in keyof RendererEvents]: OptionalArgs<{
    command: K,
    args: OmitArgs<Parameters<RendererEvents[K]>, [KeyboardEvent]>,
  }>
}> | ValueOf<{
  [K in keyof GlobalCommands]: OptionalArgs<{
    command: K,
    args: OmitArgs<Parameters<GlobalCommands[K]>, [BrowserWindow | undefined, KeyboardEvent]>,
  }>
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
}> | ValueOf<{
  [K in keyof XtermEvents]: OptionalArgs<{
    command: K,
    args: Parameters<XtermEvents[K]>,
  }>
}> | {
  command?: never,
  args?: never[],
}

export type MenuItem = Partial<MenuItemConstructorOptions> & KeyBindingCommand & {
  submenu?: MenuItem[],
}

export type KeyBinding = MenuItem & {
  label: NonNullable<MenuItem['label']>,
  accelerator: NonNullable<MenuItem['accelerator']>,
  when?: 'keydown' | 'keyup',
}
