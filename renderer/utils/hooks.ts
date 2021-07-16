import { ipcRenderer } from 'electron'
import { customRef, toRaw, watchEffect } from 'vue'

export function injectIPC<T>(key: string, defaultValue: T) {
  return customRef<T>((track, trigger) => {
    let value = defaultValue
    ipcRenderer.invoke(`get-ref:${key}`).then((newValue: T) => {
      value = newValue
      trigger()
    })
    watchEffect((onInvalidate) => {
      const handler = (event, newValue: T) => {
        value = newValue
        trigger()
      }
      ipcRenderer.on(`update-ref:${key}`, handler)
      onInvalidate(() => {
        ipcRenderer.off(`update-ref:${key}`, handler)
      })
    })
    return {
      get() {
        track()
        return value
      },
      set(newValue) {
        ipcRenderer.invoke(`set-ref:${key}`, toRaw(newValue))
      },
    }
  })
}

export function useAsyncComputed<T>(factory: () => Promise<T>, defaultValue: T) {
  return customRef<T>((track, trigger) => {
    let currentValue = defaultValue
    watchEffect(async () => {
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
