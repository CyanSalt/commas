import { memoize } from 'lodash-es'
import { unref, computed } from 'vue'
import defaultKeyBindings from '../assets/keybindings.mjs'
import { useRemoteData } from './remote.mjs'

export const useUserKeyBindings = memoize(() => {
  return useRemoteData([], {
    getter: 'get-keybindings',
  })
})

const keybindingsRef = computed(() => {
  const userKeyBindings = unref(useUserKeyBindings())
  return [
    ...userKeyBindings.filter(
      item => item.command && item.command.startsWith('xterm:')
    ),
    ...defaultKeyBindings,
  ]
})

export function useKeyBindings() {
  return keybindingsRef
}
