import type { KeyBinding } from '@commas/types/menu'
import defaultKeyBindings from '../assets/keybindings'
import { injectIPC } from '../utils/compositions'

const allKeyBindings = $(injectIPC<KeyBinding[]>('keybindings', []))

export function useAllKeyBindings() {
  return $$(allKeyBindings)
}

const keybindings = $computed(() => {
  return [
    ...allKeyBindings.filter(
      item => item.command?.startsWith('xterm:'),
    ),
    ...defaultKeyBindings,
  ]
})

export function useKeyBindings() {
  return $$(keybindings)
}
