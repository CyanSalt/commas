import * as commas from 'commas:api/renderer'
import { readonly } from 'vue'
import type { EditorTheme } from '../types/theme'

export const useEditorTheme = commas.helper.reuse(() => {
  return readonly(commas.helper.surface(
    commas.ipcRenderer.inject('editor-theme', {} as EditorTheme),
    true,
  ))
})

export function openCodeEditorTab(file: string) {
  return commas.workspace.openPaneTab('editor', {
    shell: file,
  })!
}
