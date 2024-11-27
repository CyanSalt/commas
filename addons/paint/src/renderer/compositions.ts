import * as path from 'node:path'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'

export function openPaintTab(file: string) {
  return commas.workspace.openPaneTab('paint', {
    shell: file,
  })
}

export function setPaintTabFile(tab: TerminalTab, file: string) {
  tab.shell = file
  tab.process = file
  tab.cwd = path.dirname(file)
}
