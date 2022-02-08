import { ipcRenderer } from 'electron'
import { ref } from 'vue'
import { translate } from '../utils/i18n'

export const isTabListEnabledRef = ref(true)
export function useIsTabListEnabled() {
  return isTabListEnabledRef
}

export const isFindingRef = ref(false)
export function useIsFinding() {
  return isFindingRef
}

export const willQuitRef = ref(false)
export function useWillQuit() {
  return willQuitRef
}

export async function confirmClosing() {
  const args = {
    type: 'question',
    message: translate('Close Window?#!terminal.1'),
    detail: translate('All tabs in this window will be closed.#!terminal.2'),
    buttons: [
      translate('Confirm#!terminal.3'),
      translate('Cancel#!terminal.4'),
    ],
    defaultId: 0,
    cancelId: 1,
  }
  const { response } = await ipcRenderer.invoke('message-box', args)
  return response === 0
}

export function handleShellMessages() {
  ipcRenderer.on('toggle-finding', () => {
    isFindingRef.value = !isFindingRef.value
  })
  ipcRenderer.on('toggle-tab-list', () => {
    isTabListEnabledRef.value = !isTabListEnabledRef.value
  })
  ipcRenderer.on('before-quit', () => {
    willQuitRef.value = true
  })
}
