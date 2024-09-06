import type { IpcRefValue, Refs } from '@commas/electron-ipc'
import { ipcRenderer } from '@commas/electron-ipc'
import { cloneDeep } from 'lodash'
import { customRef, watchEffect } from 'vue'

export function injectIPC<
  K extends keyof Refs,
>(key: K, defaultValue: IpcRefValue<Refs[K]>, token?: string) {
  return customRef<IpcRefValue<Refs[K]>>((track, trigger) => {
    let currentValue = defaultValue
    let initialized = false
    watchEffect((onInvalidate) => {
      const handler = (event, newValue: IpcRefValue<Refs[K]>, currentToken?: string) => {
        if (token && currentToken !== token) return
        initialized = true
        currentValue = newValue
        trigger()
      }
      // @ts-expect-error inference limitation
      ipcRenderer.on(`update-ref:${key}`, handler)
      onInvalidate(() => {
        // @ts-expect-error inference limitation
        ipcRenderer.send(`stop-ref:${key}`, token)
        // @ts-expect-error inference limitation
        ipcRenderer.off(`update-ref:${key}`, handler)
      })
    })
    return {
      get() {
        track()
        if (!initialized) {
          initialized = true
          // @ts-expect-error inference limitation
          ipcRenderer.invoke(`get-ref:${key}`, token).then((newValue: IpcRefValue<Refs[K]>) => {
            currentValue = newValue
            trigger()
          })
        }
        return currentValue
      },
      set(newValue) {
        // @ts-expect-error inference limitation
        ipcRenderer.invoke(`set-ref:${key}`, cloneDeep(newValue), token)
      },
    }
  })
}
