import { shallowReactive, markRaw } from 'vue'
import { activateOrAddTerminalTab } from '../../renderer/hooks/terminal'
import { createIDGenerator } from '../../renderer/utils/helper'
import type { TerminalTab, TerminalTabPane } from '../../typings/terminal'
import type { CommasContext } from '../types'

const tabs = shallowReactive<Record<string, TerminalTab>>({})
const generateID = createIDGenerator()

function registerTabPane(this: CommasContext, name: string, pane: TerminalTabPane) {
  tabs[name] = markRaw({
    pid: generateID(),
    process: '',
    title: '',
    cwd: '',
    pane,
  }) as unknown as TerminalTab
  this.$.app.onCleanup(() => {
    delete tabs[name]
  })
}

function getPaneTab(name: string) {
  return tabs[name]
}

function openPaneTab(name: string) {
  activateOrAddTerminalTab(getPaneTab(name))
}

export {
  registerTabPane,
  getPaneTab,
  openPaneTab,
}
