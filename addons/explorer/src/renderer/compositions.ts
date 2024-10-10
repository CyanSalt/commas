import * as path from 'node:path'
import * as commas from 'commas:api/renderer'

export function getDirectoryProcess(directory: string) {
  return directory.endsWith(path.sep) ? directory : directory + path.sep
}

export function openFileExplorerTab(directory: string) {
  return commas.workspace.openPaneTab('explorer', { cwd: directory })!
}

const terminal = $(commas.workspace.useCurrentTerminal())
const settings = commas.remote.useSettings()

export function splitOrCloseFileExplorerTab(directory: string) {
  const current = terminal
  const pane = commas.workspace.getPane('explorer')!
  const dir = getDirectoryProcess(directory)
  if (current && current.group) {
    const existingTab = commas.workspace.getTerminalTabByPane(pane, {
      cwd: dir,
      group: current.group,
    })
    if (existingTab) {
      commas.workspace.closeTerminalTab(existingTab)
      return
    }
  }
  const titlePosition = settings['terminal.view.tabListPosition'] === 'top' ? 'bottom' : 'top'
  const tab = openFileExplorerTab(directory)
  if (current && !current.pane) {
    const siblings = current.group
      ? commas.workspace.getTerminalTabsByGroup(current.group)
        .filter(item => item !== current)
      : []
    if (siblings.every(item => item.pane)) {
      commas.workspace.appendTerminalTab(
        current,
        commas.workspace.getTerminalTabIndex(tab),
        titlePosition,
      )
    }
  }
}
