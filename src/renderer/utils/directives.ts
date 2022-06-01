import type { ReactiveEffectRunner, Directive, DirectiveHook } from 'vue'
import { effect, stop } from 'vue'

export interface DirectiveEffectBinding<T> {
  el: T,
  key: string,
  effect: ReactiveEffectRunner,
}

export function createReactiveDirective<T, U>(hook: DirectiveHook<T, unknown, U>): Directive<T, U> {
  const bindings = new Set<DirectiveEffectBinding<T>>()
  const stopEffect: DirectiveHook<T, unknown, U> = (el, binding) => {
    const { arg } = binding
    const attr = arg ?? ''
    bindings.forEach(item => {
      if (item.el === el && item.key === attr) {
        stop(item.effect)
        bindings.delete(item)
      }
    })
  }
  const updateEffect: DirectiveHook<T, unknown, U> = (el, binding, vnode, prevVnode) => {
    stopEffect(el, binding, vnode, prevVnode)
    const reactiveEffect = effect(() => {
      hook(el, binding, vnode, prevVnode)
    })
    bindings.add({
      el,
      key: binding.arg ?? '',
      effect: reactiveEffect,
    })
  }
  return {
    mounted: updateEffect,
    updated: updateEffect,
    unmounted: stopEffect,
  }
}
