import * as path from 'node:path'
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import PaintPane from './PaintPane.vue'
import { openPaintTab } from './compositions'

function getNewFileName() {
  return commas.remote.translate('New Whiteboard#!paint.1', {
    increment: '',
  }) + '.excalidraw.svg'
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('paint', {
    title: '',
    component: PaintPane,
    factory: async info => {
      const shell = info?.shell || await ipcRenderer.invoke('save-file-path', getNewFileName())
      return {
        shell,
        process: shell,
        cwd: path.dirname(shell),
      }
    },
  })

  commas.context.provide('terminal.file-opener', {
    extensions: ['.excalidraw', '.excalidraw.json', '.excalidraw.svg', '.excalidraw.png'],
    handler(file) {
      openPaintTab(file)
    },
  })

  commas.context.provide('terminal.icon', {
    name: 'simple-icons-excalidraw',
    patterns: [/\.excalidraw(\.svg|\.json)?$/],
    color: '#6965DB',
  })

  commas.context.provide('terminal.shell', {
    label: 'Whiteboard#!paint.2',
    command: 'open-pane',
    args: ['paint'],
  })

}
