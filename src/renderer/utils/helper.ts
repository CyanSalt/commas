import type { Ref } from 'vue'
import { onActivated, unref, watchEffect } from 'vue'

interface MousePressingOptions {
  onMove?: (event: MouseEvent) => void,
  onEnd?: (event?: MouseEvent) => void,
}

export function handleMousePressing({ onMove, onEnd }: MousePressingOptions) {
  function cancel(event) {
    if (onMove) {
      window.removeEventListener('mousemove', onMove)
    }
    window.removeEventListener('mouseup', cancel)
    if (onEnd) {
      onEnd(event)
    }
  }
  if (onMove) {
    window.addEventListener('mousemove', onMove, { passive: true })
  }
  window.addEventListener('mouseup', cancel)
  return cancel
}

export function usePersistScrollPosition(elementRef: Ref<HTMLElement | undefined>) {
  let scrollPosition = $ref<[number, number]>([0, 0])
  watchEffect((onInvalidate) => {
    const el = unref(elementRef)
    if (!el) return
    const listener = () => {
      scrollPosition = [el.scrollLeft, el.scrollTop]
    }
    el.addEventListener('scroll', listener, { passive: true })
    onInvalidate(() => {
      el.removeEventListener('scroll', listener)
    })
  })
  onActivated(() => {
    const el = unref(elementRef);
    [el!.scrollLeft, el!.scrollTop] = scrollPosition
  })
}
