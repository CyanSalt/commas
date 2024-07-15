import * as fs from 'node:fs'
import type { Ref } from '@vue/reactivity'
import { computed, customRef, effect, stop, unref } from '@vue/reactivity'
import { cloneDeep } from 'lodash'
import YAML from 'yaml'
import type { IpcRefValue, Refs } from '@commas/electron-ipc'
import { ipcMain } from '@commas/electron-ipc'
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

function useJSONFile<T>(file: string, defaultValue?: T, { onTrigger }: { onTrigger?: () => void } = {}) {
  const contentRef = useFile(file, { onTrigger })
  return computed<T>({
    get: () => {
      const content = unref(contentRef)
      if (typeof content !== 'undefined') {
        try {
          return JSON.parse(content) as T
        } catch {
          // ignore error
        }
      }
      return defaultValue as T
    },
    set: value => {
      writeFile(file, JSON.stringify(value, null, 2))
    },
  })
}

function useYAMLFile<T>(file: string, defaultValue?: T, { onTrigger }: { onTrigger?: () => void } = {}) {
  const contentRef = useFile(file, { onTrigger })
  return computed<T>({
    get: () => {
      const content = unref(contentRef)
      if (typeof content !== 'undefined') {
        try {
          return YAML.parse(content) ?? defaultValue
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

function provideIPC<K extends keyof Refs = keyof Refs>(key: K, valueRef: Ref<IpcRefValue<Refs[K]>>) {
  // @ts-expect-error inference limitation
  ipcMain.handle(`get-ref:${key}`, async () => {
    const value = await Promise.resolve(unref(valueRef))
    return cloneDeep(value)
  })
  // @ts-expect-error inference limitation
  ipcMain.handle(`set-ref:${key}`, (event, value: IpcRefValue<Refs[K]>) => {
    valueRef.value = value
  })
  let latestValuePromise: Promise<Awaited<IpcRefValue<Refs[K]>>>
  const reactiveEffect = effect(async () => {
    const valuePromise = Promise.resolve(unref(valueRef))
    latestValuePromise = valuePromise
    const value = await valuePromise
    if (valuePromise === latestValuePromise) {
      // @ts-expect-error inference limitation
      broadcast(`update-ref:${key}`, cloneDeep(value))
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
  useJSONFile,
  useYAMLFile,
  provideIPC,
}
