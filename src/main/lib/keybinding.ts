import { computed, ref, unref } from '@vue/reactivity'
import type { KeyBinding } from '../../typings/menu'
import { provideIPC, useYAMLFile } from '../utils/compositions'
import { userFile } from '../utils/directory'

const userKeyBindingsRef = useYAMLFile<KeyBinding[]>(userFile('keybindings.yaml'), [])
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
