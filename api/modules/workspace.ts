import { isMatch } from 'lodash'
import { markRaw, reactive, shallowReactive } from 'vue'
import type { TerminalInfo, TerminalTab, TerminalTabAddons, TerminalTabPane } from '@commas/types/terminal'
import {
  activateOrAddTerminalTab,
  activateTerminalTab,
  closeTerminalTab,
  createTerminalTab,
  executeTerminalTab,
  getTerminalTabIndex,
  getTerminalTabsByCharacter,
  getTerminalTabTitle,
  scrollToMarker,
  showTabOptions,
  useCurrentTerminal,
  usePaneTabURL,
  useTerminalTabGroupSeparating,
  useTerminalTabs,
} from '../../src/renderer/compositions/terminal'
import { createTerminalTabContextMenu } from '../../src/renderer/utils/terminal'
import type { RendererAPIContext } from '../types'

const tabs = $(useTerminalTabs())

const panes = shallowReactive<Record<string, TerminalTabPane | undefined>>({})

function registerTabPane(this: RendererAPIContext, name: string, pane: TerminalTabPane) {
  panes[name] = { name, ...pane }
  this.$.app.onInvalidate(() => {
    delete panes[name]
  })
}

function getPane(name: string) {
  return panes[name]
}

function getTerminalTabByPane(pane: TerminalTabPane, info: Partial<TerminalInfo> = {}) {
  return tabs.find(tab => tab.pane?.name === pane.name && isMatch(tab, info))
}

function createPaneTab(pane: TerminalTabPane, info?: Partial<TerminalInfo>) {
  return reactive({
    pid: 0,
    process: pane.name,
    title: '',
    cwd: '',
    ...info,
    pane: markRaw(pane),
  } as unknown as TerminalTab)
}

function openPaneTab(name: string) {
  const pane = getPane(name)
  if (!pane) return
  const tab = getTerminalTabByPane(pane)
  if (tab) {
    activateTerminalTab(tab)
  } else {
    const paneTab = createPaneTab(pane)
    activateOrAddTerminalTab(paneTab)
  }
}

function registerXtermAddon<T extends keyof TerminalTabAddons>(
  this: RendererAPIContext,
  key: T,
  factory: (tab: TerminalTab) => TerminalTabAddons[T] | undefined,
  immediate?: boolean,
) {
  const apply = (tab: TerminalTab, active: boolean) => {
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
  }

  let active = false

  this.$.app.events.on('terminal.addons-loaded', tab => {
    apply(tab, active)
  })

  const toggle = (enabled: boolean) => {
    if (active === enabled) return
    active = enabled
    tabs.forEach(tab => {
      if (!tab.pane) {
        apply(tab, active)
      }
    })
  }

  this.$.app.onInvalidate(() => {
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
  getPane,
  getTerminalTabByPane,
  createPaneTab,
  openPaneTab,
  registerXtermAddon,
  activateOrAddTerminalTab,
  activateTerminalTab,
  closeTerminalTab,
  createTerminalTab,
  executeTerminalTab,
  getTerminalTabsByCharacter,
  getTerminalTabTitle,
  scrollToMarker,
  showTabOptions,
  useCurrentTerminal,
  usePaneTabURL,
  useTerminalTabs,
  useTerminalTabGroupSeparating,
  getTerminalTabIndex,
  createTerminalTabContextMenu,
}
