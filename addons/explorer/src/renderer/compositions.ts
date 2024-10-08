import * as path from 'node:path'
import * as commas from 'commas:api/renderer'

export function getDirectoryProcess(directory: string) {
  return directory.endsWith(path.sep) ? directory : directory + path.sep
}

export function openFileExplorerTab(directory: string) {
  const pane = commas.workspace.getPane('explorer')!
  const dir = getDirectoryProcess(directory)
  let tab = commas.workspace.getTerminalTabByPane(pane, { cwd: dir })
  if (!tab) {
    tab = commas.workspace.createPaneTab(pane, {
      pid: 0,
      process: dir,
      cwd: dir,
      shell: '/',
    })
  }
  commas.workspace.activateOrAddTerminalTab(tab)
  return tab
}

const terminal = $(commas.workspace.useCurrentTerminal())
const settings = commas.remote.useSettings()

export function splitOrCloseFileExplorerTab(directory: string) {
  const current = terminal
  const pane = commas.workspace.getPane('explorer')!
  const dir = getDirectoryProcess(directory)
  const existingTab = commas.workspace.getTerminalTabByPane(pane, { cwd: dir })
  if (existingTab && current && existingTab.group && existingTab.group === current.group) {
    commas.workspace.closeTerminalTab(existingTab)
  } else {
    const titlePosition = settings['terminal.view.tabListPosition'] === 'top' ? 'bottom' : 'top'
    const tab = openFileExplorerTab(directory)
    if (current && !current.pane && !current.group) {
      commas.workspace.appendTerminalTab(
        current,
        commas.workspace.getTerminalTabIndex(tab),
        titlePosition,
      )
    }
  }
}
