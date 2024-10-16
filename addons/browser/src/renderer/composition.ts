import * as commas from 'commas:api/renderer'

export function openBrowserTab(url: string) {
  return commas.workspace.openPaneTab('browser', {
    command: url,
  })
}
