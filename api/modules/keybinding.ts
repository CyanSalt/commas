import { addKeyBinding, removeKeyBinding } from '../../main/lib/keybinding'
import type { KeyBinding } from '../../typings/keybinding'

function add(binding: KeyBinding) {
  addKeyBinding(binding)
  this.$.app.onCleanup(() => {
    removeKeyBinding(binding)
  })
}

export {
  add,
}
