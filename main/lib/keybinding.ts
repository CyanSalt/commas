import { computed, ref, unref } from '@vue/reactivity'
import type { KeyBinding } from '../../typings/keybinding'
import { userData } from '../utils/directory'
import { provideIPC } from '../utils/hooks'

async function loadKeyBindings() {
  const result = await userData.load<KeyBinding[]>('keybindings.json')
  return result ?? []
}

const userKeyBindingsRef = ref(loadKeyBindings())
const addonKeyBindingsRef = ref<KeyBinding[]>([])

function useUserKeyBindings() {
  return userKeyBindingsRef
}

function useAddonKeyBindings() {
  return addonKeyBindingsRef
}

const keyBindingsRef = computed(async () => {
  const loadingUserKeyBindings = unref(userKeyBindingsRef)
  const addonKeyBindings = unref(addonKeyBindingsRef)
  const userKeyBindings = await loadingUserKeyBindings
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
