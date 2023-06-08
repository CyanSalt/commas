import { memoize } from 'lodash'

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
