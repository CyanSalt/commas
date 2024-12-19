import type { GlobalCommands, RendererEvents } from '@commas/electron-ipc'
import type { BrowserWindow, KeyboardEvent, MenuItemConstructorOptions } from 'electron'
import type { ValueOf } from 'type-fest'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface XtermEvents {}

type OptionalArgs<T extends { args: unknown[] }> = [] extends T['args'] ? Omit<T, 'args'> & Partial<Pick<T, 'args'>> : T

type FindKey<T extends Record<PropertyKey, unknown>, U> = keyof {
  [K in keyof T as T[K] extends U ? K : never]: unknown
}

type CoalesceNever<T, U> = [T] extends [never] ? U : T

type RecoverArgs<T extends unknown[], U extends Record<PropertyKey, unknown>> = T extends [infer Head, ...infer Others]
  ? [CoalesceNever<FindKey<U, Head>, Head>, ...RecoverArgs<Others, U>]
  : T

type RecoverCommandArgs<T extends unknown[]> = RecoverArgs<T, {
  $window: BrowserWindow | undefined,
  $event: KeyboardEvent,
}>

export type KeyBindingCommand = ValueOf<{
  [K in keyof RendererEvents]: OptionalArgs<{
    command: K,
    args: RecoverCommandArgs<Parameters<RendererEvents[K]>>,
  }>
}> | ValueOf<{
  [K in keyof GlobalCommands]: OptionalArgs<{
    command: K,
    args: RecoverCommandArgs<Parameters<GlobalCommands[K]>>,
  }>
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
