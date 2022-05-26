import { ipcRenderer } from 'electron'
import { customRef, toRaw, watchEffect } from 'vue'

export function injectIPC<T>(key: string, defaultValue: T, token?: string) {
  return customRef<T>((track, trigger) => {
    let currentValue = defaultValue
    let initialized = false
    watchEffect((onInvalidate) => {
      const handler = (event, newValue: T, currentToken?: string) => {
        if (token && currentToken !== token) return
        initialized = true
        currentValue = newValue
        trigger()
      }
      ipcRenderer.on(`update-ref:${key}`, handler)
      onInvalidate(() => {
        ipcRenderer.send(`stop-ref:${key}`, token)
        ipcRenderer.off(`update-ref:${key}`, handler)
      })
    })
    return {
      get() {
        track()
        if (!initialized) {
          initialized = true
          ipcRenderer.invoke(`get-ref:${key}`, token).then((newValue: T) => {
            currentValue = newValue
            trigger()
          })
        }
        return currentValue
      },
      set(newValue) {
        ipcRenderer.invoke(`set-ref:${key}`, toRaw(newValue), token)
      },
    }
  })
}
