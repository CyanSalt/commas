import { memoize } from 'lodash'
import type { Ref } from 'vue'
import { toValue, watch } from 'vue'

interface MousePressingOptions {
  element?: Window | HTMLElement,
  onMove?: (event: MouseEvent) => void,
  onEnd?: (event: MouseEvent) => void,
  onLeave?: (event: MouseEvent) => void,
  active?: boolean,
}

export function handleMousePressing({ element, onMove, onEnd, onLeave, active }: MousePressingOptions) {
  const target = element ?? window
  function cancel() {
    if (onMove) {
      target.removeEventListener('mousemove', onMove)
    }
    if (onLeave) {
      target.removeEventListener('mouseleave', onLeave)
    }
    target.removeEventListener('mouseup', stop)
  }
  function stop(event: MouseEvent) {
    cancel()
    if (onEnd) {
      onEnd(event)
    }
  }
  if (onMove) {
    target.addEventListener('mousemove', onMove, { passive: !active })
  }
  if (onLeave) {
    target.addEventListener('mouseleave', onLeave)
  }
  target.addEventListener('mouseup', stop)
  return cancel
}

const getHTMLWrapper = memoize(() => document.createElement('div'))

export function escapeHTML(text: string) {
  const wrapper = getHTMLWrapper()
  wrapper.textContent = text
  return wrapper.innerHTML
}

export function useViewTransition<T>(refOrGetter: Ref<T> | (() => T)) {
  let value = $shallowRef(toValue(refOrGetter))
  watch(refOrGetter, newValue => {
    document.startViewTransition(() => {
      value = newValue as typeof value
    })
  })
  return $$(value) as Ref<T> & { readonly value: T }
}

export function loadingElement<T extends HTMLElement>(element: T) {
  return new Promise<T>((resolve, reject) => {
    function handleLoad() {
      dispose()
      resolve(element)
    }
    function handleError(event: ErrorEvent) {
      reject(event.error)
    }
    function dispose() {
      element.removeEventListener('load', handleLoad)
      element.removeEventListener('error', handleError)
    }
    element.addEventListener('load', handleLoad, { once: true })
    element.addEventListener('error', handleError, { once: true })
  })
}
