import { debounce } from 'lodash-es'
import { watch, unref } from 'vue'

/**
 * @template T
 * @typedef {import('vue').Ref<T>} Ref
 */

/**
 * @param {(id: number) => number} [iterator]
 */
export function createIDGenerator(iterator) {
  if (!iterator) iterator = id => id + 1
  let id = 0
  return () => {
    id = iterator(id)
    return id
  }
}

/**
 * @param {object} options
 * @param {(event: Event) => void=} options.onMove
 * @param {(event?: Event) => void=} options.onEnd
 */
export function handleMousePressing({ onMove, onEnd }) {
  if (onMove) onMove = debounce(onMove)
  function cancel(event) {
    if (onMove) {
      window.removeEventListener('mousemove', onMove)
    }
    window.removeEventListener('mouseup', cancel)
    if (onEnd) onEnd(event)
  }
  if (onMove) {
    window.addEventListener('mousemove', onMove, { passive: true })
  }
  window.addEventListener('mouseup', cancel)
  return cancel
}

/**
 * @param {() => void} fn
 * @param {number} timeout
 */
export function createTimeout(fn, timeout) {
  let timer = setTimeout(() => {
    timer = null
    fn()
  }, timeout)
  return function () {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }
}

/**
 * @template T
 * @param {Ref<T>} dataRef
 * @param {(value: T) => boolean} [validator]
 * @returns {Promise<T>}
 */
export function useAwaiter(dataRef, validator) {
  return new Promise((resolve) => {
    if (validator) {
      const value = unref(dataRef)
      if (validator(value)) {
        resolve(value)
        return
      }
    }
    const unwatch = watch(dataRef, value => {
      unwatch()
      resolve(value)
    })
  })
}
