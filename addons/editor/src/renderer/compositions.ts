import * as path from 'node:path'
import * as commas from 'commas:api/renderer'
import { readonly } from 'vue'
import type { TerminalTab } from '../../../../src/typings/terminal'
import type { EditorTheme } from '../typings/theme'

export const useEditorTheme = commas.helper.reuse(() => {
  return readonly(commas.helper.surface(
    commas.ipcRenderer.inject('editor-theme', {} as EditorTheme),
    true,
  ))
})

export function openCodeEditorTab(file: string) {
  const pane = commas.workspace.getPane('editor')!
  let tab = commas.workspace.getTerminalTabByPane(pane, { shell: file })
  if (!tab) {
    tab = commas.workspace.createPaneTab(pane, {
      pid: 0,
      process: file,
      cwd: path.dirname(file),
      shell: file,
    } as unknown as TerminalTab)
  }
  commas.workspace.activateOrAddTerminalTab(tab)
}
