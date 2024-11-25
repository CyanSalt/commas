import * as path from 'node:path'
import { ipcRenderer } from '@commas/electron-ipc'
import * as commas from 'commas:api/renderer'
import CodeEditorPane from './CodeEditorPane.vue'
import { openCodeEditorTab } from './compositions'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-code-editor': (file: string) => void,
  }
}

function getNewFileName() {
  return commas.remote.translate('New File#!editor.1', {
    increment: '',
  }) + '.txt'
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('editor', {
    title: '',
    component: CodeEditorPane,
    factory: async info => {
      const shell = info?.shell || await ipcRenderer.invoke('save-file-path', getNewFileName())
      return {
        shell,
        process: shell,
        cwd: path.dirname(shell),
      }
    },
  })

  commas.ipcRenderer.on('open-code-editor', (event, file) => {
    openCodeEditorTab(file)
  })

  commas.context.handle('global-renderer:open-file', (file) => {
    openCodeEditorTab(file)
  })

  commas.context.handle('global-renderer:add-file', (file) => {
    openCodeEditorTab(file)
  })

  commas.context.provide('terminal.shell', {
    label: 'Text File#!editor.2',
    command: 'open-pane',
    args: ['editor'],
  })

}
