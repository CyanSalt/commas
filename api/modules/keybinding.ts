import { addKeyBinding, removeKeyBinding } from '../../main/lib/keybinding'
import type { KeyBinding } from '../../typings/keybinding'
import type { CommasContext } from '../types'

function add(this: CommasContext, binding: KeyBinding) {
  addKeyBinding(binding)
  this.$.app.onCleanup(() => {
    removeKeyBinding(binding)
  })
}

export {
  add,
}
