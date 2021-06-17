import { effect, stop, toRaw, unref } from '@vue/reactivity'
import type { ReactiveEffectOptions, Ref } from '@vue/reactivity'
import { ipcMain } from 'electron'
import { broadcast } from '../lib/frame'

export function useEffect<T>(fn: (onInvalidate: (cleanupFn: () => void) => void) => T, options?: ReactiveEffectOptions) {
  let cleanup: (() => void) | undefined
  const onInvalidate = (cleanupFn) => {
    cleanup = cleanupFn
  }
  return effect(() => {
    if (cleanup) cleanup()
    cleanup = undefined
    return fn(onInvalidate)
  }, {
    ...options,
    onStop() {
      if (cleanup) cleanup()
      const onStop = options?.onStop
      if (onStop) onStop()
    },
  })
}

export function provideIPC<T>(key: string, valueRef: Ref<T>) {
  ipcMain.handle(`get-ref:${key}`, () => toRaw(unref(valueRef)))
  ipcMain.handle(`set-ref:${key}`, (event, value: T) => {
    valueRef.value = value
  })
  const reactiveEffect = effect(async () => {
    const value = unref(valueRef)
    broadcast(`update-ref:${key}`, await value)
  })
  return () => {
    ipcMain.removeHandler(`get-ref:${key}`)
    ipcMain.removeHandler(`set-ref:${key}`)
    stop(reactiveEffect)
  }
}
