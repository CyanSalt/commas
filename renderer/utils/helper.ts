import { debounce } from 'lodash-es'

type IDIterator = (id: number) => number

export function createIDGenerator(iterator?: IDIterator) {
  if (!iterator) iterator = id => id + 1
  let id = 0
  return () => {
    id = iterator!(id)
    return id
  }
}

interface MousePressingOptions {
  onMove?: (event: MouseEvent) => void,
  onEnd?: (event?: MouseEvent) => void,
}

export function handleMousePressing({ onMove, onEnd }: MousePressingOptions) {
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

export function createTimeout(fn: () => void, timeout: number) {
  let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
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
