import type { IpcRendererListener } from '@commas/electron-ipc'
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import type { MaybeRefOrGetter } from 'vue'
import { toValue, watchEffect } from 'vue'
import type { TTYRecFrame } from '../types/ttyrec'

export function openRecorderTab(file: string) {
  return commas.workspace.openPaneTab('recorder', {
    shell: file,
  })
}

export function openRemoteRecorderTab(url: string) {
  return commas.workspace.openPaneTab('recorder', {
    command: url,
  })
}

export function useTTYRecFrames(url: MaybeRefOrGetter<string>) {
  let frames = $ref<TTYRecFrame[]>([])
  watchEffect(onInvalidate => {
    const source = toValue(url)
    ipcRenderer.invoke('ttyrec-read', source)
    const listener: IpcRendererListener<(target: string, data: TTYRecFrame) => void> = (event, target, data) => {
      if (target === source) {
        frames.push(data)
      }
    }
    ipcRenderer.on('ttyrec-read-data', listener)
    onInvalidate(() => {
      ipcRenderer.off('ttyrec-read-data', listener)
      frames = []
    })
  })
  return $$(frames)
}
