import * as path from 'node:path'
import * as commas from 'commas:api/renderer'
import { markRaw, reactive, readonly } from 'vue'
import type { TerminalTab } from '../../../../src/typings/terminal'
import type { EditorTheme } from '../typings/theme'
import CodeEditorPane from './CodeEditorPane.vue'

const tabs = $(commas.workspace.useTerminalTabs())

export const useEditorTheme = commas.helper.reuse(() => {
  return readonly(commas.helper.surface(
    commas.ipcRenderer.inject('editor-theme', {} as EditorTheme),
    true,
  ))
})

export function openCodeEditorTab(file: string) {
  let tab = tabs.find(item => {
    return item.pane?.type === 'editor' && item.shell === file
  })
  if (!tab) {
    tab = reactive({
      pid: 0,
      process: path.basename(file),
      title: '',
      cwd: path.dirname(file),
      shell: file,
      pane: markRaw({
        type: 'editor',
        title: '',
        component: CodeEditorPane,
      }),
    } as unknown as TerminalTab)
  }
  commas.workspace.activateOrAddTerminalTab(tab)
}
