import { ipcRenderer } from 'electron'
import { computed, shallowRef, toRaw, unref, watchEffect } from 'vue'

export function injectIPC<T>(key: string, defaultValue: T) {
  const dataRef = shallowRef(defaultValue)
  watchEffect(async () => {
    dataRef.value = await ipcRenderer.invoke(`get-ref:${key}`)
  })
  watchEffect((onInvalidate) => {
    const handler = (event, value: T) => {
      dataRef.value = value
    }
    ipcRenderer.on(`update-ref:${key}`, handler)
    onInvalidate(() => {
      ipcRenderer.off(`update-ref:${key}`, handler)
    })
  })
  return computed<T>({
    get: () => {
      return unref(dataRef)
    },
    set: value => {
      ipcRenderer.invoke(`set-ref:${key}`, toRaw(value))
    },
  })
}
