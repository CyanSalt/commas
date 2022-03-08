import { debounce } from 'lodash-es'

type IDIterator = (id: number) => number

export function createIDGenerator(iterator?: IDIterator) {
  if (!iterator) {
    iterator = id => id + 1
  }
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

export function calculateDOM<T, U extends HTMLElement = HTMLDivElement>(
  fn: (insertedElement: U) => T,
  targetElement?: U,
) {
  const el = targetElement ?? document.createElement('div') as unknown as U
  el.style.position = 'fixed'
  el.style.pointerEvents = 'none'
  el.style.opacity = '0'
  document.body.append(el)
  const result = fn(el)
  el.remove()
  return result
}

export function loadingElement<T extends HTMLElement>(element: T) {
  if (element instanceof HTMLImageElement && element.complete) {
    return element
  }
  return new Promise<T>((resolve, reject) => {
    element.addEventListener('load', () => {
      resolve(element)
    })
    element.addEventListener('error', (event: ErrorEvent) => {
      reject(event.error)
    })
  })
}
