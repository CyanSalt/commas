import * as path from 'node:path'
import { ipcRenderer } from '@commas/electron-ipc'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'
import type { TTYRecFrame } from '../types/ttyrec'
import CameraAnchor from './CameraAnchor.vue'
import RecorderAnchor from './RecorderAnchor.vue'
import RecorderPane from './RecorderPane.vue'
import { openRecorderTab, openRemoteRecorderTab } from './composables'
import { RecorderAddon } from './xterm'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'ttyrec-read-data': (url: string, data: TTYRecFrame) => void,
    'open-remote-recorder': (url: string) => void,
  }
  export interface GlobalCommands {
    'toggle-recorder': (tab: TerminalTab, status: boolean) => void,
  }
}

declare module '@commas/types/terminal' {
  export interface TerminalTabAddons {
    recorder: RecorderAddon,
  }
}

function formatDateAsFileName(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}.${String(date.getMinutes()).padStart(2, '0')}.${String(date.getSeconds()).padStart(2, '0')}`
}

function generateFileName(date: Date) {
  return commas.remote.translate('Terminal Recording ${date}#!camera.1', {
    date: formatDateAsFileName(date),
  }) + '.ttyrec'
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.context.provide('terminal.ui-right-action-anchor', RecorderAnchor)

  commas.context.provide('terminal.ui-right-action-anchor', CameraAnchor)

  const toggle = commas.workspace.registerXtermAddon(
    'recorder',
    tab => new RecorderAddon(tab, {
      onInitialize(startedAt) {
        const date = new Date(startedAt)
        return generateFileName(date)
      },
      onData(data, channel) {
        ipcRenderer.invoke('ttyrec-write-data', channel, data)
      },
      onEnd(channel) {
        ipcRenderer.invoke('ttyrec-write-end', channel)
      },
    }),
  )

  commas.context.handle('toggle-recorder', (tab, status) => {
    toggle(status, tab)
  })

  commas.workspace.registerTabPane('recorder', {
    title: '',
    component: RecorderPane,
    factory: async info => {
      if (info?.command) {
        return {
          command: info.command,
        }
      }
      const shell = info?.shell || await ipcRenderer.invoke('save-file-path', generateFileName(new Date()))
      return {
        shell,
        process: shell,
        cwd: path.dirname(shell),
      }
    },
  })

  commas.context.provide('terminal.file-opener', {
    extensions: ['.ttyrec'],
    handler(file) {
      openRecorderTab(file)
    },
  })

  commas.context.provide('terminal.icon', {
    name: 'lucide-file-video-2',
    patterns: [/\.ttyrec$/],
  })

  commas.ipcRenderer.on('open-remote-recorder', (event, url) => {
    openRemoteRecorderTab(url)
  })

}
