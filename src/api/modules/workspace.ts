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
  filterTerminalTabsByKeyword,
  getTerminalTabIndex,
  getTerminalTabsByCharacter,
  getTerminalTabsByGroup,
  getTerminalTabTitle,
  scrollToMarker,
  showTabOptions,
  useCurrentTerminal,
  useReadonlyTerminal,
  useTerminalTabGroupSeparating,
  useTerminalTabs,
} from '../../renderer/compositions/terminal'
import { createTerminalTabContextMenu, getTerminalExecutorCommand, isErrorExitCode, TERMINAL_DIRECTORY_SHELL } from '../../renderer/utils/terminal'
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
    pane.factory = async info => ({
      pid: Number(generateID()),
      ...await factory?.(info),
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

export type PaneTabInfo = Pick<TerminalTab, 'command' | 'process' | 'cwd' | 'shell' | 'character'>

async function createPaneTab(pane: TerminalTabPane, info?: Partial<PaneTabInfo>) {
  return reactive({
    pid: 0,
    process: pane.name,
    title: '',
    cwd: '',
    ...info,
    ...await pane.factory?.(info),
    pane: markRaw(pane),
  } as TerminalTab)
}

async function openPaneTab(name: string, info?: Partial<PaneTabInfo>) {
  const pane = getPane(name)
  if (!pane) return undefined as never
  if (!pane.volatile) {
    const tab = getTerminalTabByPane(pane, info)
    if (tab) {
      activateTerminalTab(tab)
      return tab
    }
  }
  const paneTab = await createPaneTab(pane, info)
  await activateOrAddTerminalTab(paneTab)
  return paneTab
}

function registerXtermAddon<T extends keyof TerminalTabAddons>(
  this: RendererAPIContext,
  key: T,
  factory: (tab: TerminalTab) => TerminalTabAddons[T] | undefined,
  options?: {
    immediate?: boolean,
  },
) {
  const { immediate } = options ?? {}
  const apply = (tab: TerminalTab, active: boolean) => {
    if (active && !tab.addons[key]) {
      const addon = factory(tab)
      if (addon) {
        tab.addons[key] = addon
        tab.xterm.loadAddon(tab.addons[key])
      }
    } else if (!active && tab.addons[key]) {
      tab.addons[key].dispose()
      delete tab.addons[key]
    }
  }

  let active = false

  this.$.app.events.on('terminal.addons-loaded', tab => {
    apply(tab, active)
  })

  const toggle = (enabled: boolean, tab?: TerminalTab) => {
    if (tab) {
      if (!tab.pane) {
        apply(tab, enabled)
      }
    } else if (active !== enabled) {
      active = enabled
      tabs.forEach(item => {
        if (!item.pane) {
          apply(item, enabled)
        }
      })
    }
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
  useTerminalTabs,
  useTerminalTabGroupSeparating,
  getTerminalTabIndex,
  createTerminalTabContextMenu,
  getTerminalTabsByGroup,
  appendTerminalTab,
  TERMINAL_DIRECTORY_SHELL,
  useReadonlyTerminal,
  getTerminalExecutorCommand,
  isErrorExitCode,
  filterTerminalTabsByKeyword,
}
