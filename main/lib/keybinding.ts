import { ipcMain } from 'electron'
import memoize from 'lodash/memoize'
import type { KeyBinding } from '../../typings/keybinding'
import { userData } from '../utils/directory'

async function loadKeyBindings() {
  return (await userData.load<KeyBinding[]>('keybindings.json')) ?? []
}

const getUserKeyBindings = memoize(() => {
  return loadKeyBindings()
})

const addonKeyBindings: KeyBinding[] = []

function getAddonKeyBindings() {
  return addonKeyBindings
}

function addKeyBinding(item: KeyBinding) {
  addonKeyBindings.push(item)
}

function removeKeyBinding(item: KeyBinding) {
  const index = addonKeyBindings.indexOf(item)
  if (index !== -1) {
    addonKeyBindings.splice(index, 1)
  }
}

async function getKeyBindings() {
  const userKeyBindings = await getUserKeyBindings()
  return [
    ...userKeyBindings,
    ...addonKeyBindings,
  ]
}

function handleKeyBindingMessages() {
  ipcMain.handle('get-keybindings', () => {
    return getKeyBindings()
  })
}

export {
  getKeyBindings,
  getUserKeyBindings,
  getAddonKeyBindings,
  addKeyBinding,
  removeKeyBinding,
  handleKeyBindingMessages,
}
