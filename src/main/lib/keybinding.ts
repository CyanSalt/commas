import { computed, ref, unref } from '@vue/reactivity'
import { globalShortcut } from 'electron'
import type { KeyBinding } from '../../typings/menu'
import { provideIPC, useYAMLFile } from '../utils/compositions'
import { userFile } from '../utils/directory'
import { execa } from '../utils/helper'
import { openFile } from './window'

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

function registerGlobalShortcuts() {
  if (process.platform === 'darwin') {
    globalShortcut.register('CmdOrCtrl+Alt+T', async () => {
      const { stdout: frontmost } = await execa(`osascript -e 'tell application "System Events" to get name of application processes whose frontmost is true and visible is true'`)
      if (frontmost.trim() === 'Finder') {
        const { stdout } = await execa(`osascript -e 'tell application "Finder" to get the POSIX path of (target of front window as alias)'`)
        openFile(stdout.trim())
      }
    })
  }
}

function handleKeyBindingMessages() {
  provideIPC('keybindings', keyBindingsRef)
}

export {
  useUserKeyBindings,
  useAddonKeyBindings,
  registerGlobalShortcuts,
  handleKeyBindingMessages,
}
