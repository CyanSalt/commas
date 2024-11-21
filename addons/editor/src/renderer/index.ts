import * as path from 'node:path'
import * as commas from 'commas:api/renderer'
import unusedFilename from 'unused-filename'
import CodeEditorPane from './CodeEditorPane.vue'
import { openCodeEditorTab } from './compositions'

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-code-editor': (file: string) => void,
  }
}

function getNewFileName() {
  const name = commas.remote.translate('New File#!editor.1', {
    increment: '',
  }) + '.txt'
  const file = path.join(commas.app.getPath('downloads'), name)
  return unusedFilename.sync(file)
}

export default () => {

  commas.ui.addCSSFile('dist/renderer/style.css')

  commas.workspace.registerTabPane('editor', {
    title: '',
    component: CodeEditorPane,
    factory: info => {
      const shell = info?.shell || getNewFileName()
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

}
