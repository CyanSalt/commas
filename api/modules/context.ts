import { shallowReactive } from '@vue/reactivity'
import type { Component } from 'vue'
import type { APIContext } from '../types'

export interface Context {
  // Renderer
  '@ui-action-anchor': Component,
  '@ui-side-list': Component,
  '@ui-slot': Component,
}

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
  if (data.length) {
    this.$.app.onCleanup(() => {
      cancelProviding(name, ...data)
    })
  }
}

export * from '../shim'

export {
  getCollection,
  provide,
  cancelProviding,
}
