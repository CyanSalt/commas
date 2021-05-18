import { memoize } from 'lodash-es'
import { unref, computed } from 'vue'
import defaultKeyBindings from '../assets/keybindings'
import { injectIPC } from '../utils/hooks'
import type { KeyBinding } from '../../typings/keybinding'

export const useAllKeyBindings = memoize(() => {
  return injectIPC<KeyBinding[]>('keybindings', [])
})

const keybindingsRef = computed(() => {
  const allKeyBindings = unref(useAllKeyBindings())
  return [
    ...allKeyBindings.filter(
      item => item.command?.startsWith('xterm:')
    ),
    ...defaultKeyBindings,
  ]
})

export function useKeyBindings() {
  return keybindingsRef
}
