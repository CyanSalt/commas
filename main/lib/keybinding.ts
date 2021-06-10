import { computed, ref, unref } from '@vue/reactivity'
import { userData } from '../utils/directory'
import { provideIPC } from '../utils/hooks'
import type { KeyBinding } from '../../typings/keybinding'

const userKeyBindingsRef = userData.useYAML<KeyBinding[]>('keybindings.yaml', [])
const addonKeyBindingsRef = ref<KeyBinding[]>([])

function useUserKeyBindings() {
  return userKeyBindingsRef
}

function useAddonKeyBindings() {
  return addonKeyBindingsRef
}

const keyBindingsRef = computed(() => {
  const userKeyBindings = unref(userKeyBindingsRef)
  const addonKeyBindings = unref(addonKeyBindingsRef)
  return [
    ...userKeyBindings,
    ...addonKeyBindings,
  ]
})

function handleKeyBindingMessages() {
  provideIPC('keybindings', keyBindingsRef)
}

export {
  useUserKeyBindings,
  useAddonKeyBindings,
  handleKeyBindingMessages,
}
