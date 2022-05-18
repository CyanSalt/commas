import type { Ref } from '@vue/reactivity'
import { customRef, effect, shallowReactive, stop, unref } from '@vue/reactivity'
import { difference, intersection, isEqual } from 'lodash'

export function useAsyncComputed<T>(factory: () => Promise<T>): Ref<T | undefined>
export function useAsyncComputed<T>(factory: () => Promise<T>, defaultValue: T): Ref<T>

export function useAsyncComputed<T>(factory: () => Promise<T>, defaultValue?: T) {
  return customRef<T | undefined>((track, trigger) => {
    let currentValue = defaultValue
    effect(async () => {
      try {
        currentValue = await factory()
      } catch {
        currentValue = defaultValue
      }
      trigger()
    })
    return {
      get() {
        track()
        return currentValue
      },
      set() {
        // ignore
      },
    }
  })
}


function initializeSurface<T>(valueRef: Ref<T>, reactiveObject: T) {
  let running = 0
  const markRunning = async (value: number) => {
    running = value
    await 'next tick'
    running = 0
  }
  effect(() => {
    const latest = unref(valueRef)
    if (running) return
    markRunning(1)
    const latestKeys = Object.keys(latest)
    const currentKeys = Object.keys(reactiveObject)
    difference(latestKeys, currentKeys).forEach(key => {
      reactiveObject[key] = latest[key]
    })
    intersection(currentKeys, latestKeys).forEach(key => {
      if (!isEqual(reactiveObject[key], latest[key])) {
        reactiveObject[key] = latest[key]
      }
    })
    difference(currentKeys, latestKeys).forEach(key => {
      delete reactiveObject[key]
    })
  })
  effect(() => {
    const value = { ...reactiveObject }
    if (running) return
    markRunning(2)
    valueRef.value = value
  })
}

export function surface<T extends object>(valueRef: Ref<T>, lazy?: boolean) {
  const reactiveObject = shallowReactive({} as T) as T
  if (lazy) {
    let initialized = false
    const lockEffect = effect(() => {
      unref(valueRef)
      if (!initialized) {
        initialized = true
        return
      }
      stop(lockEffect)
      initializeSurface(valueRef, reactiveObject)
    })
  } else {
    initializeSurface(valueRef, reactiveObject)
  }
  return reactiveObject
}