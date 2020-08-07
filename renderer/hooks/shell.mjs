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
    type: 'info',
    message: translate('Close Window?#!1'),
    detail: translate('All tabs in this window will be closed.#!2'),
    buttons: [
      translate('Confirm#!3'),
      translate('Cancel#!4'),
    ],
    defaultId: 0,
    cancelId: 1,
  }
  const { response } = await ipcRenderer.invoke('message-box', args)
  if (response === 0) ipcRenderer.invoke('destroy')
}

export function handleShellMessages() {
  ipcRenderer.on('toggle-finding', () => {
    isFindingRef.value = !isFindingRef.value
  })
  ipcRenderer.on('toggle-tab-list', () => {
    isTabListEnabledRef.value = !isTabListEnabledRef.value
  })
}