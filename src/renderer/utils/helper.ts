import { debounce } from 'lodash'

interface MousePressingOptions {
  onMove?: (event: MouseEvent) => void,
  onEnd?: (event?: MouseEvent) => void,
}

export function handleMousePressing({ onMove, onEnd }: MousePressingOptions) {
  if (onMove) {
    onMove = debounce(onMove)
  }
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
