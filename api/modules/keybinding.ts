import { markRaw, unref } from '@vue/reactivity'
import { useAddonKeyBindings } from '../../src/main/lib/keybinding'
import type { KeyBinding } from '../../src/typings/menu'
import type { MainAPIContext } from '../types'

function addKeyBinding(item: KeyBinding) {
  const addonKeyBindings = unref(useAddonKeyBindings())
  addonKeyBindings.push(markRaw(item))
}

function removeKeyBinding(item: KeyBinding) {
  const addonKeyBindings = unref(useAddonKeyBindings())
  const index = addonKeyBindings.indexOf(item)
  if (index !== -1) {
    addonKeyBindings.splice(index, 1)
  }
}

function addKeyBindings(this: MainAPIContext, bindings: KeyBinding[]) {
  bindings.forEach(binding => {
    addKeyBinding(binding)
  })
  this.$.app.onCleanup(() => {
    bindings.forEach(binding => {
      removeKeyBinding(binding)
    })
  })
}

export * from '../shim'

export {
  addKeyBindings,
}
