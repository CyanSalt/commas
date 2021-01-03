import { ipcRenderer } from 'electron'
import { watchEffect, shallowRef, computed, unref, toRaw } from 'vue'

export function watchRemoteEffect(event: string, handler: (...args: any[]) => void) {
  watchEffect((onCleanup) => {
    ipcRenderer.on(event, handler)
    onCleanup(() => {
      ipcRenderer.off(event, handler)
    })
  })
}

interface RemoteDataOptions {
  getter?: string,
  setter?: string,
  effect?: string,
}

export function useRemoteData<T>(defaultValue: T, { getter, setter, effect }: RemoteDataOptions = {}) {
  const dataRef = shallowRef(defaultValue)
  if (effect) {
    watchRemoteEffect(effect, (event, value) => {
      dataRef.value = value
    })
  }
  if (getter) {
    watchEffect(async () => {
      dataRef.value = await ipcRenderer.invoke(getter)
    })
  }
  if (setter) {
    return computed<T>({
      get: () => {
        return unref(dataRef)
      },
      set: value => {
        ipcRenderer.invoke(setter, toRaw(value))
      },
    })
  } else {
    return dataRef
  }
}
