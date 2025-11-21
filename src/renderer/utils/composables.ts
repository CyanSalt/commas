import { cloneDeep } from 'lodash'
import type { MaybeRefOrGetter } from 'vue'
import { customRef, toValue, watch, watchEffect } from 'vue'
import type { IpcRefValue, Refs } from '@commas/electron-ipc'
import { ipcRenderer } from '@commas/electron-ipc'

export function injectIPC<
  K extends keyof Refs,
>(key: K, defaultValue: IpcRefValue<Refs[K]>, token?: MaybeRefOrGetter<string | undefined>) {
  return customRef<IpcRefValue<Refs[K]>>((track, trigger) => {
    let currentValue = defaultValue
    let initialized = false
    function resolve(newValue: IpcRefValue<Refs[K]>, currentToken?: string) {
      const tokenValue = toValue(token)
      if (tokenValue && currentToken !== tokenValue) return
      initialized = true
      currentValue = newValue
      trigger()
    }
    watchEffect((onInvalidate) => {
      const handler = (event, newValue: IpcRefValue<Refs[K]>, currentToken?: string) => {
        resolve(newValue, currentToken)
      }
      // @ts-expect-error inference limitation
      ipcRenderer.on(`update-ref:${key}`, handler)
      onInvalidate(() => {
        // @ts-expect-error inference limitation
        ipcRenderer.off(`update-ref:${key}`, handler)
      })
    })
    watchEffect((onInvalidate) => {
      const tokenValue = toValue(token)
      onInvalidate(() => {
        // @ts-expect-error inference limitation
        ipcRenderer.send(`stop-ref:${key}`, tokenValue)
      })
    })
    function evaluate() {
      const currentToken = toValue(token)
      // @ts-expect-error inference limitation
      ipcRenderer.invoke(`get-ref:${key}`, currentToken).then((newValue: IpcRefValue<Refs[K]>) => {
        resolve(newValue, currentToken)
      })
    }
    watch(() => toValue(token), () => {
      if (initialized) {
        currentValue = defaultValue
        evaluate()
      }
    }, { immediate: true })
    return {
      get() {
        track()
        if (!initialized) {
          initialized = true
          evaluate()
        }
        return currentValue
      },
      set(newValue) {
        // @ts-expect-error inference limitation
        ipcRenderer.invoke(`set-ref:${key}`, cloneDeep(newValue), toValue(token))
      },
    }
  })
}
