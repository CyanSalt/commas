import { unref, computed } from 'vue'
import { memoize } from 'lodash-es'
import { useRemoteData } from './remote'
import defaultKeyBindings from '../assets/keybindings'

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
