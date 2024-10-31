import type { GlobalCommands } from '@commas/electron-ipc'
import { shallowReactive } from '@vue/reactivity'
import { globalHandler } from '../../shared/handler'
import type { APIContext } from '../types'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Context {}

const namespaces = shallowReactive<Record<string, any[]>>({})

function getCollection<T extends keyof Context>(name: T): Context[T][] {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (namespaces[name]) {
    return namespaces[name]
  }
  namespaces[name] = shallowReactive([])
  return namespaces[name]
}

function cancelProviding<T extends keyof Context>(name: T, ...data: Context[T][]) {
  const collection = getCollection(name)
  for (const item of data) {
    const index = collection.indexOf(item)
    collection.splice(index, 1)
  }
}

function provide<T extends keyof Context>(this: APIContext, name: keyof Context, ...data: Context[T][]) {
  const collection = getCollection(name)
  collection.push(...data)
  this.$.app.onInvalidate(() => {
    cancelProviding(name, ...data)
  })
}

function handleOnce<K extends keyof GlobalCommands>(this: APIContext, channel: K, listener: GlobalCommands[K]) {
  globalHandler.handleOnce(channel, listener)
}

function removeHandler<K extends keyof GlobalCommands>(this: APIContext, channel: K) {
  return globalHandler.removeHandler(channel)
}

function handle<K extends keyof GlobalCommands>(this: APIContext, channel: K, listener: GlobalCommands[K]) {
  const defaultHandler = globalHandler.removeHandler(channel)
  globalHandler.handle(channel, listener)
  if (defaultHandler) {
    this.$.app.onInvalidate(() => {
      globalHandler.handle(channel, defaultHandler)
    })
  }
}

function invoke<K extends keyof GlobalCommands>(
  channel: K,
  ...args: Parameters<GlobalCommands[K]>
) {
  return globalHandler.invoke(channel, ...args)
}

export * from '../shim'

export {
  getCollection,
  provide,
  handle,
  handleOnce,
  removeHandler,
  invoke,
}
