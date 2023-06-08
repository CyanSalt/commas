import { memoize } from 'lodash'
import type { ComponentPublicInstance, KeepAlive, Ref, VNode } from 'vue'
import { onActivated, unref, watchEffect } from 'vue'

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

export function unmountKeptAlive(instance: InstanceType<typeof KeepAlive>, key: VNode['key']) {
  const internalInstance = (instance as unknown as ComponentPublicInstance).$
  const cache: Map<typeof key, VNode> = internalInstance['__v_cache']
  if (!cache.has(key)) return
  const vnode = cache.get(key)!
  let shapeFlag = vnode.shapeFlag
  // eslint-disable-next-line no-bitwise
  if (shapeFlag & 256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */) {
    shapeFlag -= 256 /* ShapeFlags.COMPONENT_SHOULD_KEEP_ALIVE */
  }
  // eslint-disable-next-line no-bitwise
  if (shapeFlag & 512 /* ShapeFlags.COMPONENT_KEPT_ALIVE */) {
    shapeFlag -= 512 /* ShapeFlags.COMPONENT_KEPT_ALIVE */
  }
  vnode.shapeFlag = shapeFlag
  const sharedContext = internalInstance['ctx']
  const parentSuspense = internalInstance['suspense']
  const { renderer: { um: unmount } } = sharedContext
  unmount(vnode, instance, parentSuspense, true)
  cache.delete(key)
}

const getHTMLWrapper = memoize(() => document.createElement('div'))

export function escapeHTML(text: string) {
  const wrapper = getHTMLWrapper()
  wrapper.textContent = text
  return wrapper.innerHTML
}
