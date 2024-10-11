import type { TerminalTab, TerminalTabAddons, TerminalTabPane } from '@commas/types/terminal'
import { isMatch } from 'lodash'
import { markRaw, reactive, shallowReactive } from 'vue'
import {
  activateOrAddTerminalTab,
  activateTerminalTab,
  appendTerminalTab,
  closeTerminalTab,
  createTerminalTab,
  executeTerminalTab,
  getTerminalTabIndex,
  getTerminalTabsByCharacter,
  getTerminalTabsByGroup,
  getTerminalTabTitle,
  scrollToMarker,
  showTabOptions,
  useCurrentTerminal,
  usePaneTabURL,
  useTerminalTabGroupSeparating,
  useTerminalTabs,
} from '../../renderer/compositions/terminal'
import { createTerminalTabContextMenu, TERMINAL_DIRECTORY_SHELL } from '../../renderer/utils/terminal'
import type { RendererAPIContext } from '../types'

const tabs = $(useTerminalTabs())

const panes = shallowReactive<Record<string, TerminalTabPane | undefined>>({})

function registerTabPane(this: RendererAPIContext, name: string, pane: TerminalTabPane) {
  panes[name] = {
    name,
    icon: this.__manifest__?.['commas:icon'],
    ...pane,
  }
  if (pane.volatile) {
    const generateID = this.$.helper.createIDGenerator()
    const factory = pane.factory
    pane.factory = info => ({
      pid: Number(generateID()),
      ...factory?.(info),
    })
  }
  this.$.app.onInvalidate(() => {
    delete panes[name]
  })
}

function getPane(name: string) {
  return panes[name]
}

function getTerminalTabByPane(pane: TerminalTabPane, info: Partial<TerminalTab> = {}) {
  return tabs.find(tab => tab.pane?.name === pane.name && isMatch(tab, info))
}

function createPaneTab(pane: TerminalTabPane, info?: Partial<TerminalTab>) {
  return reactive({
    pid: 0,
    process: pane.name,
    title: '',
    cwd: '',
    ...info,
    ...pane.factory?.(info),
    pane: markRaw(pane),
  } as TerminalTab)
}

function openPaneTab(name: string, info?: Partial<TerminalTab>) {
  const pane = getPane(name)
  if (!pane) return
  if (!pane.volatile) {
    const tab = getTerminalTabByPane(pane, info)
    if (tab) {
      activateTerminalTab(tab)
      return tab
    }
  }
  const paneTab = createPaneTab(pane, info)
  activateOrAddTerminalTab(paneTab)
  return paneTab
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
  getTerminalTabsByGroup,
  appendTerminalTab,
  TERMINAL_DIRECTORY_SHELL,
}
