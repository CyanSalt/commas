import type { Ref } from '@vue/reactivity'
import { effect, shallowReactive, unref } from '@vue/reactivity'
import { difference } from 'lodash'

export function surface<T extends object>(valueRef: Ref<T>) {
  const reactiveObject = shallowReactive({} as T) as T
  let running = 0
  effect(() => {
    if (running === 2) {
      running = 0
      return
    }
    running = 1
    const latest = unref(valueRef)
    const latestKeys = Object.keys(latest)
    const currentKeys = Object.keys(reactiveObject)
    Object.assign(reactiveObject, latest)
    difference(currentKeys, latestKeys).forEach(key => {
      delete reactiveObject[key]
    })
  })
  effect(() => {
    if (running === 1) {
      running = 0
      return
    }
    running = 2
    valueRef.value = { ...reactiveObject }
  })
  return reactiveObject
}
