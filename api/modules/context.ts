import { shallowReactive } from '@vue/reactivity'
import type { CommasContext } from '../types'

const namespaces = shallowReactive<Record<string, any[]>>({})

function getCollection(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (namespaces[name]) {
    return namespaces[name]
  }
  namespaces[name] = shallowReactive([])
  return namespaces[name]
}

function cancelProviding(name: string, ...data: any[]) {
  const collection = getCollection(name)
  for (const item of data) {
    const index = collection.indexOf(item)
    collection.splice(index, 1)
  }
}

function provide(this: CommasContext, name: string, ...data: any[]) {
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
