import { memoize } from 'lodash-es'
import { unref, computed } from 'vue'
import defaultKeyBindings from '../assets/keybindings.mjs'
import { useRemoteData } from './remote.mjs'

export const useAllKeyBindings = memoize(() => {
  return useRemoteData([], {
    getter: 'get-keybindings',
  })
})

const keybindingsRef = computed(() => {
  const allKeyBindings = unref(useAllKeyBindings())
  return [
    ...allKeyBindings.filter(
      item => item.command && item.command.startsWith('xterm:')
    ),
    ...defaultKeyBindings,
  ]
})

export function useKeyBindings() {
  return keybindingsRef
}
