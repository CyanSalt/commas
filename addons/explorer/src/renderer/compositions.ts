import * as path from 'node:path'
import * as commas from 'commas:api/renderer'

const generateID = commas.helper.createIDGenerator()

export function getDirectoryProcess(directory: string) {
  return directory.endsWith(path.sep) ? directory : directory + path.sep
}

export function openFileExplorerTab(directory: string) {
  const pane = commas.workspace.getPane('explorer')!
  const dir = getDirectoryProcess(directory)
  const tab = commas.workspace.createPaneTab(pane, {
    pid: Number(generateID()),
    process: dir,
    cwd: dir,
    shell: commas.workspace.TERMINAL_DIRECTORY_SHELL,
  })
  commas.workspace.activateOrAddTerminalTab(tab)
  return tab
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
  if (current && !current.pane && !current.group) {
    commas.workspace.appendTerminalTab(
      current,
      commas.workspace.getTerminalTabIndex(tab),
      titlePosition,
    )
  }
}
