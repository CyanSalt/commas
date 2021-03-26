import { computed, markRaw, ref, unref } from '@vue/reactivity'
import type { KeyBinding } from '../../typings/keybinding'
import { userData } from '../utils/directory'
import { provideIPC } from '../utils/hooks'

async function loadKeyBindings() {
  const result = await userData.load<KeyBinding[]>('keybindings.json')
  return result ?? []
}

const userKeyBindingsRef = ref(loadKeyBindings())
const addonKeyBindingsRef = ref<KeyBinding[]>([])

function getUserKeyBindings() {
  return unref(userKeyBindingsRef)
}

function getAddonKeyBindings() {
  return unref(addonKeyBindingsRef)
}

function addKeyBinding(item: KeyBinding) {
  const addonKeyBindings = unref(addonKeyBindingsRef)
  addonKeyBindings.push(markRaw(item))
}

function removeKeyBinding(item: KeyBinding) {
  const addonKeyBindings = unref(addonKeyBindingsRef)
  const index = addonKeyBindings.indexOf(item)
  if (index !== -1) {
    addonKeyBindings.splice(index, 1)
  }
}

const keyBindingsRef = computed(async () => {
  const userKeyBindings = unref(userKeyBindingsRef)
  const addonKeyBindings = unref(addonKeyBindingsRef)
  return [
    ...(await userKeyBindings),
    ...addonKeyBindings,
  ]
})

function handleKeyBindingMessages() {
  provideIPC('keybindings', keyBindingsRef)
}

export {
  getUserKeyBindings,
  getAddonKeyBindings,
  addKeyBinding,
  removeKeyBinding,
  handleKeyBindingMessages,
}
