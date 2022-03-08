import { shallowReactive, markRaw, unref } from 'vue'
import type { ITerminalAddon } from 'xterm'
import {
  activateOrAddTerminalTab,
  activateTerminalTab,
  createTerminalTab,
  executeTerminalTab,
  getTerminalTabTitle,
  useCurrentTerminal,
  useTerminalTabs,
} from '../../renderer/compositions/terminal'
import { createIDGenerator } from '../../renderer/utils/helper'
import type { TerminalTab, TerminalTabPane } from '../../typings/terminal'
import type { RendererAPIContext } from '../types'

const panes = shallowReactive<Record<string, TerminalTab>>({})
const generateID = createIDGenerator()

function registerTabPane(this: RendererAPIContext, name: string, pane: TerminalTabPane) {
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
  this: RendererAPIContext,
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

function registerXtermAddon(
  this: RendererAPIContext,
  key: string,
  factory: (tab: TerminalTab) => ITerminalAddon | undefined,
  immediate?: boolean,
) {
  return effectTerminalTab.call(this, (tab: TerminalTab, active: boolean) => {
    const addon = factory(tab)
    if (addon) {
      if (active && !tab.addons[key]) {
        tab.addons[key] = addon
        tab.xterm.loadAddon(tab.addons[key])
      } else if (!active && tab.addons[key]) {
        tab.addons[key].dispose()
        delete tab.addons[key]
      }
    }
  }, immediate)
}

export * from '../shim'

export {
  registerTabPane,
  getPaneTab,
  openPaneTab,
  effectTerminalTab,
  registerXtermAddon,
  activateOrAddTerminalTab,
  activateTerminalTab,
  createTerminalTab,
  executeTerminalTab,
  getTerminalTabTitle,
  useCurrentTerminal,
  useTerminalTabs,
}
