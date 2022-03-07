import * as url from 'url'
import { shallowReactive, markRaw, unref } from 'vue'
import { useLanguage } from '../../renderer/compositions/i18n'
import { useDiscoveredAddons, useSettings, useSettingsSpecs, useUserSettings } from '../../renderer/compositions/settings'
import {
  activateOrAddTerminalTab,
  useTerminalTabs,
  createTerminalTab,
  activateTerminalTab,
  executeTerminalTab,
} from '../../renderer/compositions/terminal'
import { useAsyncComputed } from '../../renderer/utils/compositions'
import { getAppVersion, openContextMenu } from '../../renderer/utils/frame'
import { createIDGenerator } from '../../renderer/utils/helper'
import { resolveHome } from '../../renderer/utils/terminal'
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

function addCSSFile(this: CommasContext, file: string) {
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url.pathToFileURL(file).href
  document.head.append(link)
  this.$.app.onCleanup(() => {
    link.remove()
  })
}

export * from '../shim'

export {
  registerTabPane,
  getPaneTab,
  openPaneTab,
  useTerminalTabs,
  createTerminalTab,
  activateTerminalTab,
  executeTerminalTab,
  effectTerminalTab,
  // TODO: review and clean these
  addCSSFile,
  openContextMenu,
  useLanguage,
  useSettings,
  resolveHome,
  useAsyncComputed,
  getAppVersion,
  useDiscoveredAddons,
  useSettingsSpecs,
  useUserSettings,
}
