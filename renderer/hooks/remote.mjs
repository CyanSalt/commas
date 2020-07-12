import { watchEffect, shallowRef, computed, unref, toRaw } from 'vue'
import { ipcRenderer } from 'electron'

/**
 * @param {string} event
 * @param {(...args: any[]) => void} handler
 */
export function watchRemoteEffect(event, handler) {
  watchEffect((onInvalidate) => {
    ipcRenderer.on(event, handler)
    onInvalidate(() => {
      ipcRenderer.off(event, handler)
    })
  })
}

/**
 * @template T
 * @param {T} defaultValue
 * @param {object} options
 * @param {string=} options.getter
 * @param {string=} options.setter
 * @param {string=} options.effect
 */
export function useRemoteData(defaultValue, { getter, setter, effect } = {}) {
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
    return computed({
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
