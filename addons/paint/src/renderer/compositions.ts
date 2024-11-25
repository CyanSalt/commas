import * as commas from 'commas:api/renderer'

export function openPaintTab(file: string) {
  return commas.workspace.openPaneTab('paint', {
    shell: file,
  })
}
