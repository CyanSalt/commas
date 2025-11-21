import * as path from 'node:path'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from 'commas:api/renderer'

export function openPaintProTab(file: string) {
  return commas.workspace.openPaneTab('paint-pro', {
    shell: file,
  })
}

export function setPaintTabFile(tab: TerminalTab, file: string) {
  tab.shell = file
  tab.process = file
  tab.cwd = path.dirname(file)
}
