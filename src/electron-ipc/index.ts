import type { IpcMain, IpcMainEvent, IpcMainInvokeEvent, IpcRenderer, IpcRendererEvent } from 'electron'
// eslint-disable-next-line no-restricted-imports
import { ipcMain as electronIpcMain, ipcRenderer as electronIpcRenderer } from 'electron'
import type { Ref } from 'vue'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Commands {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Events {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Refs {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RendererCommands {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RendererEvents {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface GlobalCommands {}

type Unref<T> = T extends Ref<infer U> ? U : T

export type IpcRefValue<T> = Unref<T>

export type CommandDefinitions = Commands & {
  [K in keyof Refs as `get-ref:${K}`]: (token?: string) => IpcRefValue<Refs[K]>
} & {
  [K in keyof Refs as `set-ref:${K}`]: (value: IpcRefValue<Refs[K]>, token?: string) => void
}

export type EventDefinitions = Events & {
  [K in keyof Refs as `stop-ref:${K}`]: (value: IpcRefValue<Refs[K]>) => void
} & {
  [K in keyof RendererCommands as `return:${K}`]: (value: Awaited<ReturnType<RendererCommands[K]>>) => void
}

export type RendererEventDefinitions = RendererEvents & {
  [K in keyof Refs as `update-ref:${K}`]: (value: IpcRefValue<Refs[K]>, token?: string) => void
} & {
  [K in keyof RendererCommands as `invoke:${K}`]: (...args: Parameters<RendererCommands[K]>) => void
}

type Async<T> = T | PromiseLike<T>
type HandlerReturnType<
  T extends (...args: any) => any,
> = ReturnType<T> extends void ? void : Async<Awaited<ReturnType<T>>>

export type IpcMainHandler<T extends (...args: any[]) => any> = (
  event: IpcMainInvokeEvent,
  ...args: Parameters<T>
) => HandlerReturnType<T>

export type IpcMainListener<T extends (...args: any[]) => any> = (
  event: Omit<IpcMainEvent, 'returnValue'> & { returnValue: ReturnType<T> },
  ...args: Parameters<T>
) => void

export type IpcRendererHandler<T extends (...args: any[]) => any> = (
  event: IpcRendererEvent,
  ...args: Parameters<T>
) => Async<Awaited<ReturnType<T>>>

export type IpcRendererListener<T extends (...args: any[]) => any> = (
  event: IpcRendererEvent,
  ...args: Parameters<T>
) => void

export interface TypedIpcMain extends IpcMain {
  handle<K extends keyof CommandDefinitions>(
    channel: K,
    listener: IpcMainHandler<CommandDefinitions[K]>,
  ): void,
  handleOnce<K extends keyof CommandDefinitions>(
    channel: K,
    listener: IpcMainHandler<CommandDefinitions[K]>,
  ): void,
  on<K extends keyof EventDefinitions>(
    channel: K,
    listener: IpcMainListener<EventDefinitions[K]>,
  ): this,
  once<K extends keyof EventDefinitions>(
    channel: K,
    listener: IpcMainListener<EventDefinitions[K]>,
  ): this,
  removeHandler<K extends keyof CommandDefinitions>(
    channel: K,
  ): void,
  removeAllListeners<K extends keyof EventDefinitions>(
    channel?: K,
  ): this,
  removeListener<K extends keyof EventDefinitions>(
    channel: K,
    listener: IpcMainListener<EventDefinitions[K]>,
  ): this,
  off<K extends keyof EventDefinitions>(
    channel: K,
    listener: IpcMainListener<EventDefinitions[K]>,
  ): this,
}

export interface TypedIpcRenderer extends IpcRenderer {
  addListener<K extends keyof RendererEventDefinitions>(
    channel: K,
    listener: IpcRendererListener<RendererEventDefinitions[K]>,
  ): this,
  invoke<K extends keyof CommandDefinitions>(
    channel: K,
    ...args: Parameters<CommandDefinitions[K]>
  ): Promise<Awaited<ReturnType<CommandDefinitions[K]>>>,
  off<K extends keyof RendererEventDefinitions>(
    channel: K,
    listener: IpcRendererListener<RendererEventDefinitions[K]>,
  ): this,
  on<K extends keyof RendererEventDefinitions>(
    channel: K,
    listener: IpcRendererListener<RendererEventDefinitions[K]>,
  ): this,
  once<K extends keyof RendererEventDefinitions>(
    channel: K,
    listener: IpcRendererListener<RendererEventDefinitions[K]>,
  ): this,
  removeAllListeners<K extends keyof RendererEventDefinitions>(
    channel: K,
  ): this,
  removeListener<K extends keyof RendererEventDefinitions>(
    channel: K,
    listener: IpcRendererListener<RendererEventDefinitions[K]>,
  ): this,
  send<K extends keyof EventDefinitions>(
    channel: K,
    ...args: Parameters<EventDefinitions[K]>
  ): void,
  sendSync<K extends keyof EventDefinitions>(
    channel: K,
    ...args: Parameters<EventDefinitions[K]>
  ): ReturnType<EventDefinitions[K]>,
}

export const ipcMain: TypedIpcMain = electronIpcMain
export const ipcRenderer: TypedIpcRenderer = electronIpcRenderer
