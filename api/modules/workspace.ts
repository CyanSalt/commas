import { shallowReactive, markRaw, unref } from 'vue'
import type { ITerminalAddon } from 'xterm'
import {
  activateOrAddTerminalTab,
  activateTerminalTab,
  closeTerminalTab,
  createTerminalTab,
  executeTerminalTab,
  getTerminalTabTitle,
  useCurrentTerminal,
  usePaneTabURL,
  useTerminalTabs,
} from '../../src/renderer/compositions/terminal'
import { createIDGenerator } from '../../src/shared/helper'
import type { TerminalTab, TerminalTabPane } from '../../src/typings/terminal'
import type { RendererAPIContext } from '../types'

const paneTabs = shallowReactive<Record<string, TerminalTab | undefined>>({})
const generateID = createIDGenerator()

function registerTabPane(this: RendererAPIContext, name: string, pane: TerminalTabPane) {
  paneTabs[name] = markRaw({
    pid: generateID(),
    process: '',
    title: '',
    cwd: '',
    pane,
  } as TerminalTab)
  this.$.app.onCleanup(() => {
    delete paneTabs[name]
  })
}

function getPaneTab(name: string) {
  return paneTabs[name]
}

function openPaneTab(name: string) {
  const pane = getPaneTab(name)
  if (!pane) return
  activateOrAddTerminalTab(pane)
}

function registerXtermAddon(
  this: RendererAPIContext,
  key: string,
  factory: (tab: TerminalTab) => ITerminalAddon | undefined,
  immediate?: boolean,
) {
  const apply = (tab: TerminalTab, active: boolean) => {
    const addon = factory(tab)
    if (addon) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (active && !tab.addons[key]) {
        tab.addons[key] = addon
        tab.xterm.loadAddon(tab.addons[key])
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      } else if (!active && tab.addons[key]) {
        tab.addons[key].dispose()
        delete tab.addons[key]
      }
    }
  }

  let active = false

  this.$.app.events.on('load-terminal-addons', tab => {
    apply(tab, active)
  })

  const toggle = (enabled: boolean) => {
    if (active === enabled) return
    active = enabled
    const tabs = unref(useTerminalTabs())
    tabs.forEach(tab => {
      if (!tab.pane) {
        apply(tab, active)
      }
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
  registerXtermAddon,
  activateOrAddTerminalTab,
  activateTerminalTab,
  createTerminalTab,
  executeTerminalTab,
  closeTerminalTab,
  getTerminalTabTitle,
  useCurrentTerminal,
  useTerminalTabs,
  usePaneTabURL,
}
