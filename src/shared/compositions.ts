import type { ReactiveEffectOptions, ReactiveEffectRunner, Ref } from '@vue/reactivity'
import { customRef, deferredComputed, effect, getCurrentScope, onScopeDispose, shallowReactive, ref, stop, toRaw, unref } from '@vue/reactivity'
import { cloneDeep, difference, intersection, isEqual } from 'lodash'

export function useAsyncComputed<T>(factory: () => Promise<T>): Ref<T | undefined>
export function useAsyncComputed<T>(factory: () => Promise<T>, defaultValue: T): Ref<T>

export function useAsyncComputed<T>(factory: () => Promise<T>, defaultValue?: T) {
  return customRef<T | undefined>((track, trigger) => {
    let currentValue = defaultValue
    let initialized = false
    const { runner } = watchBaseEffect(async () => {
      try {
        currentValue = await factory()
      } catch {
        currentValue = defaultValue
      }
      trigger()
    }, { lazy: true })
    return {
      get() {
        track()
        if (!initialized) {
          initialized = true
          runner()
        }
        return currentValue
      },
      set() {
        // ignore
      },
    }
  })
}

function initializeSurface<T extends object>(valueRef: Ref<T>, reactiveObject: T) {
  let isUpdated = true
  watchBaseEffect(() => {
    const latest = unref(valueRef)
    const rawObject = toRaw(reactiveObject)
    const latestKeys = Object.keys(latest)
    const currentKeys = Object.keys(rawObject)
    difference(latestKeys, currentKeys).forEach(key => {
      isUpdated = true
      reactiveObject[key] = latest[key]
    })
    intersection(currentKeys, latestKeys).forEach(key => {
      if (!isEqual(rawObject[key], latest[key])) {
        isUpdated = true
        reactiveObject[key] = latest[key]
      }
    })
    difference(currentKeys, latestKeys).forEach(key => {
      isUpdated = true
      delete reactiveObject[key]
    })
  })
  // Make `Object.assign` to trigger once only
  const objectRef = deferredComputed(() => ({ ...reactiveObject }))
  watchBaseEffect(() => {
    const value = unref(objectRef)
    if (isUpdated) {
      isUpdated = false
      return
    }
    valueRef.value = value
  })
}

export function watchBaseEffect<T>(
  fn: (onInvalidate: (callback: () => void) => void) => T,
  options?: ReactiveEffectOptions,
) {
  const onStop = options?.onStop
  let cleanupFn: (() => void) | undefined
  const onInvalidate = (callback: () => void) => {
    cleanupFn = callback
  }
  const cleanupEffect = () => {
    if (cleanupFn) {
      cleanupFn()
      cleanupFn = undefined
    }
  }
  const reactiveEffect: ReactiveEffectRunner<T> = effect(() => {
    cleanupEffect()
    return fn(onInvalidate)
  }, {
    ...options,
    onStop() {
      cleanupEffect()
      if (onStop) {
        onStop()
      }
    },
  })
  const dispose = () => {
    stop(reactiveEffect)
  }
  const scope = getCurrentScope()
  if (scope) {
    onScopeDispose(dispose)
  }
  dispose.runner = reactiveEffect
  return dispose
}

export function surface<T extends object>(valueRef: Ref<T>, lazy?: boolean) {
  const reactiveObject = shallowReactive({} as T) as T
  if (lazy) {
    let initialized = false
    const stopEffect = watchBaseEffect(() => {
      const value = unref(valueRef)
      if (!initialized) {
        initialized = true
        Object.assign(reactiveObject, value)
        return
      }
      stopEffect()
      initializeSurface(valueRef, reactiveObject)
    })
  } else {
    initializeSurface(valueRef, reactiveObject)
  }
  return reactiveObject
}

export function deepRef<T extends object>(valueRef: Ref<T>) {
  const reactiveRef = ref() as Ref<T>
  let initialized = false
  watchBaseEffect(() => {
    initialized = false
    reactiveRef.value = unref(valueRef)
  })
  watchBaseEffect(() => {
    const value = cloneDeep(unref(reactiveRef))
    if (!initialized) {
      initialized = true
      return
    }
    valueRef.value = value
  })
  return reactiveRef
}
