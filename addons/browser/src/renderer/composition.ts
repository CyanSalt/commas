import * as commas from 'commas:api/renderer'

const generateID = commas.helper.createIDGenerator()

export function openBrowserTab(url: string) {
  const pane = commas.workspace.getPane('browser')!
  const tab = commas.workspace.createPaneTab(pane, {
    pid: Number(generateID()),
    command: url,
  })
  commas.workspace.activateOrAddTerminalTab(tab)
}
