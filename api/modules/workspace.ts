import { shallowReactive, markRaw, unref } from 'vue'
import { activateOrAddTerminalTab, useTerminalTabs } from '../../renderer/compositions/terminal'
import { createIDGenerator } from '../../renderer/utils/helper'
import type { TerminalTab, TerminalTabPane } from '../../typings/terminal'
import type { CommasContext } from '../types'

const panes = shallowReactive<Record<string, TerminalTab>>({})
const generateID = createIDGenerator()

function registerTabPane(this: CommasContext, name: string, pane: TerminalTabPane) {
  panes[name] = markRaw({
    pid: generateID(),
    process: '',
    title: '',
    cwd: '',
    pane,
  } as TerminalTab)
  this.$.app.onCleanup(() => {
    delete panes[name]
  })
}

function getPaneTab(name: string) {
  return panes[name]
}

function openPaneTab(name: string) {
  activateOrAddTerminalTab(getPaneTab(name))
}

function effectTerminalTab(
  this: CommasContext,
  callback: (tab: TerminalTab, active: boolean) => void,
  immediate?: boolean,
) {
  let active = false

  this.$.app.events.on('terminal-tab-effect', tab => {
    callback(tab, active)
  })

  const toggle = (enabled: boolean) => {
    if (active === enabled) return
    active = enabled
    const tabs = unref(useTerminalTabs())
    tabs.forEach(tab => {
      callback(tab, active)
    })
  }

  this.$.app.onCleanup(() => {
    toggle(false)
  })
  if (immediate) {
    toggle(true)
  }

  return toggle
}

export * from '../shim'

export {
  registerTabPane,
  getPaneTab,
  openPaneTab,
  useTerminalTabs,
  effectTerminalTab,
}
