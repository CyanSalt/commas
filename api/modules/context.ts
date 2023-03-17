import { shallowReactive } from '@vue/reactivity'
import { globalHandler } from '../../src/shared/handler'
import type { APIContext } from '../types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
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

function handle(this: APIContext, channel: string, listener: (...args: any[]) => any) {
  globalHandler.handle(channel, listener)
}

function handleOnce(this: APIContext, channel: string, listener: (...args: any[]) => any) {
  globalHandler.handleOnce(channel, listener)
}

function removeHandler(channel: string) {
  globalHandler.removeHandler(channel)
}

function invoke(channel: string, ...args: any[]) {
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
