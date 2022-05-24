import * as fs from 'fs'
import { computed, customRef, effect, stop, toRaw, unref } from '@vue/reactivity'
import type { ReactiveEffectOptions, Ref } from '@vue/reactivity'
import { ipcMain } from 'electron'
import YAML from 'yaml'
import { broadcast } from '../lib/frame'
import { watchFile, writeFile, writeYAMLFile } from './file'

function useFile(file: string, { onTrigger }: { onTrigger?: () => void } = {}) {
  return customRef<string | undefined>((track, trigger) => {
    let data: string | undefined
    const reactiveEffect = effect(async () => {
      try {
        data = await fs.promises.readFile(file, 'utf8')
      } catch {
        data = undefined
      }
      if (onTrigger) {
        onTrigger()
      }
      trigger()
    })
    watchFile(file, () => {
      reactiveEffect()
    })
    return {
      get: () => {
        track()
        return data
      },
      set: value => {
        writeFile(file, value)
      },
    }
  })
}

function useYAMLFile<T>(file: string, defaultValue?: T, { onTrigger }: { onTrigger?: () => void } = {}) {
  const contentRef = useFile(file, { onTrigger })
  return computed<T>({
    get: () => {
      const content = unref(contentRef)
      if (typeof content !== 'undefined') {
        try {
          return YAML.parse(content) as T
        } catch {
          // ignore error
        }
      }
      return defaultValue as T
    },
    set: value => {
      writeYAMLFile(file, value)
    },
  })
}

function useEffect<T>(
  fn: (onInvalidate: (cleanupFn: () => void) => void) => T,
  options?: ReactiveEffectOptions,
) {
  let cleanup: (() => void) | undefined
  const onInvalidate = (cleanupFn) => {
    cleanup = cleanupFn
  }
  return effect(() => {
    if (cleanup) {
      cleanup()
    }
    cleanup = undefined
    return fn(onInvalidate)
  }, {
    ...options,
    onStop() {
      if (cleanup) {
        cleanup()
      }
      const onStop = options?.onStop
      if (onStop) {
        onStop()
      }
    },
  })
}

function provideIPC<T>(key: string, valueRef: Ref<T>) {
  ipcMain.handle(`get-ref:${key}`, () => toRaw(unref(valueRef)))
  ipcMain.handle(`set-ref:${key}`, (event, value: T) => {
    valueRef.value = value
  })
  let latestValuePromise
  const reactiveEffect = effect(async () => {
    const valuePromise = Promise.resolve(toRaw(unref(valueRef)))
    latestValuePromise = valuePromise
    const value = await valuePromise
    if (valuePromise === latestValuePromise) {
      broadcast(`update-ref:${key}`, value)
    }
  })
  return () => {
    ipcMain.removeHandler(`get-ref:${key}`)
    ipcMain.removeHandler(`set-ref:${key}`)
    stop(reactiveEffect)
  }
}

export {
  useFile,
  useYAMLFile,
  useEffect,
  provideIPC,
}
