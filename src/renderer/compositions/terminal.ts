import * as os from 'node:os'
import { ipcRenderer, shell } from 'electron'
import { isMatch, trim } from 'lodash'
import { effectScope, markRaw, nextTick, reactive, shallowReactive, toRaw, watch, watchEffect } from 'vue'
import type { ITerminalOptions, IMarker } from 'xterm'
import { Terminal } from 'xterm'
import { CanvasAddon } from 'xterm-addon-canvas'
import { FitAddon } from 'xterm-addon-fit'
import { LigaturesAddon } from 'xterm-addon-ligatures'
import { SearchAddon } from 'xterm-addon-search'
import { Unicode11Addon } from 'xterm-addon-unicode11'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { WebglAddon } from 'xterm-addon-webgl'
import * as commas from '../../../api/core-renderer'
import { createDeferred } from '../../shared/helper'
import type { MenuItem } from '../../typings/menu'
import type { TerminalContext, TerminalInfo, TerminalTab, TerminalTabGroup } from '../../typings/terminal'
import { toKeyEventPattern } from '../utils/accelerator'
import { openContextMenu } from '../utils/frame'
import { translate } from '../utils/i18n'
import { ShellIntegrationAddon } from '../utils/shell-integration'
import { getPrompt, getTerminalTabID, getWindowsProcessInfo } from '../utils/terminal'
import { useA11yEnabled } from './a11y'
import { useKeyBindings } from './keybinding'
import { useSettings } from './settings'
import { useTheme } from './theme'

const settings = useSettings()
const theme = useTheme()

const tabs = $ref<TerminalTab[]>([])
export function useTerminalTabs() {
  return $$(tabs)
}

let activeIndex = $ref(-1)

const currentTerminal = $computed(() => {
  if (activeIndex === -1) return null
  return tabs[activeIndex]
})
export function useCurrentTerminal() {
  return $$(currentTerminal)
}

let paneTabURL = $ref<string>('')
export function usePaneTabURL() {
  return $$(paneTabURL)
}

let movingIndex = $ref(-1)
export function useMovingTerminalIndex() {
  return $$(movingIndex)
}

export function getTerminalTabIndex(tab: TerminalTab) {
  return tabs.indexOf(toRaw(tab))
}

export function getTerminalTabsByGroup(group: TerminalTabGroup) {
  return tabs.filter(tab => tab.group?.type === group.type && tab.group.id === group.id)
}

interface TerminalTabCategory {
  items: {
    tab?: TerminalTab | undefined,
    group?: TerminalTabGroup | undefined,
    command?: string,
  }[],
}

const tabCategories = $computed<TerminalTabCategory[]>(() => {
  const categories = commas.proxy.context.getCollection('terminal.category')
  const orderedCategories = categories.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0))
  return [
    {
      items: tabs
        .filter(tab => {
          return !orderedCategories.some(category => {
            return category.groups
              .some(group => tab.group?.type === group.type && tab.group.id === group.id)
          })
        })
        .map(tab => ({ tab, group: tab.group })),
    },
    ...orderedCategories.map<TerminalTabCategory>(category => {
      return {
        items: category.groups.flatMap(group => {
          const groupTabs = getTerminalTabsByGroup(group)
          return groupTabs.length
            ? groupTabs.map(tab => ({ tab, group, command: category.command }))
            : { group, command: category.command }
        }),
      }
    }),
  ]
})

export function getVisualTerminalTabIndex(tab: TerminalTab) {
  const visualTabs = tabCategories
    .flatMap(category => category.items)
    .map(item => item.tab)
    .filter((item): item is TerminalTab => Boolean(item))
  return visualTabs
    .map(item => toRaw(item))
    .indexOf(toRaw(tab))
}

export function isMatchLinkModifier(event: MouseEvent) {
  switch (settings['terminal.view.linkModifier']) {
    case 'Alt':
      return event.altKey
    case 'CmdOrCtrl':
      return process.platform === 'darwin' ? event.metaKey : event.ctrlKey
    default:
      return event.altKey || (process.platform === 'darwin' ? event.metaKey : event.ctrlKey)
  }
}

function handleTerminalLink(event: MouseEvent, uri: string) {
  if (isMatchLinkModifier(event)) {
    shell.openExternal(uri)
  }
}

const a11yEnabled = $(useA11yEnabled())

const terminalOptions = $computed<Partial<ITerminalOptions>>(() => {
  return {
    allowProposedApi: true,
    allowTransparency: theme.opacity < 1,
    cursorStyle: settings['terminal.style.cursorStyle'],
    fontFamily: settings['terminal.style.fontFamily'],
    fontSize: settings['terminal.style.fontSize'],
    linkHandler: {
      activate: handleTerminalLink,
    },
    overviewRulerWidth: 16,
    screenReaderMode: a11yEnabled,
    smoothScrollDuration: 50,
    theme: { ...theme },
  }
})

interface RendererKeyBinding {
  pattern: Partial<KeyboardEvent>,
  command: string,
  args?: any[],
}

const keybindings = $(useKeyBindings())
const rendererKeybindings = $computed(() => {
  return keybindings.map<RendererKeyBinding>(binding => ({
    pattern: {
      ...toKeyEventPattern(binding.accelerator),
      type: binding.when ?? 'keydown',
    },
    command: binding.command!,
    args: binding.args,
  }))
})

export interface CreateTerminalTabOptions {
  command?: string,
  group?: TerminalTabGroup,
}

export async function createTerminalTab(context: Partial<TerminalContext> = {}, {
  command,
  group,
}: CreateTerminalTabOptions = {}) {
  const info: TerminalInfo = await ipcRenderer.invoke('create-terminal', {
    cwd: context.cwd,
    shell: context.shell,
    args: toRaw(context.args),
    env: toRaw(context.env),
  })
  const xterm = new Terminal(terminalOptions)
  const tab = reactive<TerminalTab>({
    ...info,
    title: '',
    xterm: markRaw(xterm),
    addons: shallowReactive<any>({}),
    deferred: {
      open: createDeferred(),
      stop: createDeferred(),
    },
    alerting: false,
    thumbnail: '',
    group,
  })
  xterm.attachCustomKeyEventHandler(event => {
    // Support shortcuts on Windows
    if (process.platform === 'win32' && event.ctrlKey) {
      if (event.key === 'c' && xterm.hasSelection()) return false
      if (event.key === 'f') return false
    }
    const shellIntegration = tab.addons.shellIntegration
    if (shellIntegration) {
      if (shellIntegration.completion) {
        switch (event.key) {
          case 'Enter':
          case 'Tab':
            event.preventDefault()
            if (event.type === 'keydown') {
              return !shellIntegration.applySelectedCompletionElement(event.key === 'Enter')
            }
            return false
          case 'Escape':
            if (event.type === 'keydown') {
              shellIntegration.clearCompletion()
            }
            return false
          case 'ArrowUp':
            if (event.type === 'keydown') {
              shellIntegration.selectPreviousCompletionElement()
            }
            return false
          case 'ArrowDown':
            if (event.type === 'keydown') {
              shellIntegration.selectNextCompletionElement()
            }
            return false
        }
      } else {
        if (['ArrowUp', 'ArrowDown'].includes(event.key) && event.type === 'keydown') {
          shellIntegration.skipCompletion()
          return true
        }
      }
    }
    const matchedItem = rendererKeybindings.find(item => isMatch(event, item.pattern))
    if (!matchedItem) return true
    switch (matchedItem.command) {
      case 'xterm:send': {
        writeTerminalTab(tab, matchedItem.args ? matchedItem.args.join('') : '')
        return false
      }
      case 'xterm:completion': {
        if (!tab.addons.shellIntegration) return true
        tab.addons.shellIntegration.triggerCompletion()
        return false
      }
      default:
        return true
    }
  })
  const pid = info.pid
  // Setup communication between xterm.js and node-pty
  xterm.onData(data => {
    if (tab.alerting) {
      tab.alerting = false
    }
    writeTerminalTab(tab, data)
  })
  xterm.onResize(({ cols, rows }) => {
    ipcRenderer.invoke('resize-terminal', pid, { cols, rows })
  })
  xterm.onTitleChange(title => {
    tab.title = title
    if (process.platform === 'win32') {
      Object.assign(tab, getWindowsProcessInfo(tab.shell, title))
    }
  })
  let latestPromise: Promise<string | undefined>
  xterm.onLineFeed(async () => {
    if (settings['terminal.tab.liveCwd'] && !settings['terminal.shell.integration']) {
      const promise: Promise<string | undefined> = ipcRenderer.invoke('get-terminal-cwd', tab.pid)
      latestPromise = promise
      const latestCwd = await promise
      if (latestCwd && latestPromise === promise) {
        tab.cwd = latestCwd
      }
    }
  })
  xterm.onBell(() => {
    tab.alerting = true
    ipcRenderer.invoke('beep')
  })
  xterm['_core']._onFocus.event(() => {
    activateTerminalTab(tab)
  })
  const scope = effectScope()
  scope.run(() => {
    watchEffect(() => {
      for (const [key, value] of Object.entries(terminalOptions)) {
        xterm.options[key] = value
      }
      loadTerminalAddons(tab)
    })
  })
  tab.deferred.stop.promise.then(() => {
    scope.stop()
  })
  if (command) {
    executeTerminalTab(tab, command)
  }
  const targetIndex = activeIndex + 1
  tabs.splice(targetIndex, 0, tab)
  activeIndex = targetIndex
  // tabs.push(tab)
  // activeIndex = tabs.length - 1
  return tab
}

export function scrollToMarker(xterm: Terminal, marker: IMarker) {
  xterm.scrollLines(marker.line - xterm.buffer.active.viewportY)
  const decoration = xterm.registerDecoration({
    marker,
    width: xterm.cols,
  })!
  decoration.onRender(el => {
    el.classList.add('terminal-marker-highlight-line')
    el.addEventListener('animationend', () => {
      decoration.dispose()
    })
  })
}

export function getTerminalTabTitle(tab: TerminalTab) {
  if (tab.pane && !tab.shell) {
    return translate(tab.pane.title)
  }
  if (tab.group?.title) {
    return tab.group.title
  }
  if (process.platform !== 'win32' && tab.title) {
    return tab.title
  }
  const expr = settings['terminal.tab.titleFormat']
  return getPrompt(expr, tab) || tab.process
}

export function showTabOptions(event?: MouseEvent, type?: string) {
  let currentIndex = 0
  let number = 1
  let options: MenuItem[] = []
  let defaultIndex = -1
  for (let index = 0; index < tabCategories.length; index += 1) {
    if (index) {
      options.push({ type: 'separator' })
    }
    const items = tabCategories[index].items
    for (const item of items) {
      if (!type || item.group?.type === type) {
        if (item.tab && toRaw(item.tab) === toRaw(currentTerminal)) {
          defaultIndex = options.length
        }
        options.push({
          type: index ? 'checkbox' : 'normal',
          label: item.tab ? getTerminalTabTitle(item.tab) : item.group?.title,
          args: item.tab ? [currentIndex] : [item.group],
          command: item.tab ? 'select-tab' : item.command,
          accelerator: number <= 9 ? String(number) : undefined,
          checked: index ? Boolean(item.tab) : undefined,
        })
        number += 1
      }
      currentIndex += 1
    }
  }
  openContextMenu(options, event ?? [0, 0], defaultIndex)
}

function handleTerminalTabHistory() {
  let navigating: string | null = null
  window.addEventListener('popstate', event => {
    if (!event.state) return
    const targetIndex = tabs.findIndex(item => getTerminalTabID(item) === event.state.id)
    if (targetIndex !== -1) {
      navigating = event.state.id
      activeIndex = targetIndex
    }
  })
  watch($$(currentTerminal), (value, oldValue) => {
    if (value && navigating === getTerminalTabID(value)) {
      navigating = null
      return
    }
    const state = value ? { id: getTerminalTabID(value) } : null
    if (oldValue && getTerminalTabIndex(oldValue) !== -1) {
      history.pushState(state, '')
    } else {
      history.replaceState(state, '')
    }
  })
}

export function handleTerminalMessages() {
  handleTerminalTabHistory()
  watch($$(currentTerminal), () => {
    paneTabURL = ''
  }, { flush: 'sync' })
  watch($$(currentTerminal), async tab => {
    await nextTick()
    if (tab && !tab.pane) {
      tab.xterm.focus()
    }
  })
  ipcRenderer.on('open-tab', (event, context: Partial<TerminalContext>, options: CreateTerminalTabOptions) => {
    createTerminalTab(context, options)
  })
  ipcRenderer.on('duplicate-tab', event => {
    if (currentTerminal) {
      createTerminalTab(currentTerminal)
    }
  })
  ipcRenderer.on('split-tab', () => {
    if (currentTerminal) {
      splitTerminalTab(currentTerminal)
    }
  })
  ipcRenderer.on('close-tab', () => {
    if (currentTerminal) {
      closeTerminalTab(currentTerminal)
    }
  })
  ipcRenderer.on('input-terminal', (event, data: Pick<TerminalTab, 'pid' | 'process'> & { data: string }) => {
    const tab = tabs.find(item => item.pid === data.pid)
    if (!tab) return
    const xterm = tab.xterm
    xterm.write(data.data, () => {
      const activeBuffer = xterm.buffer.active
      let thumbnail: string | undefined
      for (let y = activeBuffer.baseY + activeBuffer.cursorY; y >= 0; y -= 1) {
        thumbnail = activeBuffer.getLine(y)?.translateToString(true)
        if (thumbnail) break
      }
      tab.thumbnail = thumbnail
    })
    // data.process on Windows will be always equivalent to pty.name
    if (process.platform !== 'win32') {
      tab.process = data.process
    }
  })
  ipcRenderer.on('exit-terminal', (event, data: Pick<TerminalTab, 'pid'>) => {
    const tab = tabs.find(item => item.pid === data.pid)
    if (!tab) return
    tab.deferred.stop.resolve()
    const xterm = tab.xterm
    xterm.dispose()
    removeTerminalTab(tab)
  })
  ipcRenderer.on('clear-terminal', () => {
    if (!currentTerminal) return
    const xterm = currentTerminal.xterm
    xterm.clear()
  })
  ipcRenderer.on('close-terminal', () => {
    if (!currentTerminal) return
    closeTerminalTab(currentTerminal)
  })
  ipcRenderer.on('select-tab', (event, index: number) => {
    if (!tabs.length) return
    let targetIndex = index % tabs.length
    if (targetIndex < 0) {
      targetIndex += tabs.length
    }
    const targetItem = tabCategories.flatMap(category => category.items)[targetIndex]
    if (targetItem.tab) {
      activateTerminalTab(targetItem.tab)
    }
  })
  ipcRenderer.on('select-previous-tab', () => {
    if (activeIndex > 0) {
      activeIndex -= 1
    }
  })
  ipcRenderer.on('select-next-tab', () => {
    if (activeIndex < tabs.length - 1) {
      activeIndex += 1
    }
  })
  ipcRenderer.on('scroll-to-command', (event, offset: number) => {
    if (!currentTerminal) return
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    currentTerminal.addons?.shellIntegration?.scrollToCommand(offset)
  })
  ipcRenderer.on('go-back', () => {
    history.back()
  })
  ipcRenderer.on('go-forward', () => {
    history.forward()
  })
  ipcRenderer.on('show-tab-options', () => {
    showTabOptions()
  })
  ipcRenderer.on('open-url', (event, address: string) => {
    const url = new URL(address)
    const paths = trim(url.pathname, '/').split('/')
    commas.proxy.workspace.openPaneTab(paths[0])
    paneTabURL = address
  })
  ipcRenderer.on('save', () => {
    if (!currentTerminal) return
    currentTerminal.pane?.instance?.save?.()
  })
}

export function loadTerminalAddons(tab: TerminalTab) {
  const xterm = tab.xterm
  const addons: Record<string, any> = tab.addons
  if (settings['terminal.shell.integration']) {
    if (!addons.shellIntegration) {
      addons.shellIntegration = new ShellIntegrationAddon(tab)
      xterm.loadAddon(addons.shellIntegration)
    }
  } else {
    if (addons.shellIntegration) {
      addons.shellIntegration.dispose()
      delete addons.shellIntegration
    }
  }
  if (!addons.fit) {
    addons.fit = new FitAddon()
    xterm.loadAddon(addons.fit)
    tab.deferred.open.promise.then(() => {
      addons.fit.fit()
    })
  }
  if (!addons.search) {
    addons.search = new SearchAddon()
    xterm.loadAddon(addons.search)
  }
  if (!addons.weblinks) {
    addons.weblinks = new WebLinksAddon(handleTerminalLink)
    xterm.loadAddon(addons.weblinks)
  }
  if (!addons.unicode11) {
    addons.unicode11 = new Unicode11Addon()
    xterm.loadAddon(addons.unicode11)
    xterm.unicode.activeVersion = '11'
  }
  if (settings['terminal.style.fontLigatures']) {
    if (!addons.ligatures) {
      const ligatures = new LigaturesAddon()
      addons.ligatures = ligatures
      tab.deferred.open.promise.then(() => {
        if (addons.ligatures === ligatures) {
          xterm.loadAddon(ligatures)
        }
      })
    }
  } else {
    if (addons.ligatures) {
      addons.ligatures.dispose()
      delete addons.ligatures
    }
  }
  const rendererType = settings['terminal.view.rendererType'] === 'webgl'
    ? (xterm.options.allowTransparency ? 'canvas' : 'webgl')
    : settings['terminal.view.rendererType']
  if (rendererType !== 'webgl') {
    if (addons.webgl) {
      addons.webgl.dispose()
      delete addons.webgl
    }
  }
  if (rendererType !== 'canvas') {
    if (addons.canvas) {
      addons.canvas.dispose()
      delete addons.canvas
    }
  }
  if (rendererType === 'webgl') {
    if (!addons.webgl) {
      addons.webgl = new WebglAddon()
      tab.deferred.open.promise.then(() => {
        xterm.loadAddon(addons.webgl)
      })
    }
  }
  if (rendererType === 'canvas') {
    if (!addons.canvas) {
      addons.canvas = new CanvasAddon()
      tab.deferred.open.promise.then(() => {
        xterm.loadAddon(addons.canvas)
      })
    }
  }
  commas.proxy.app.events.emit('terminal-addons-loaded', tab)
}

export function writeTerminalTab(tab: TerminalTab, data: string) {
  return ipcRenderer.invoke('write-terminal', tab.pid, data)
}

export function executeTerminalTab(tab: TerminalTab, command: string, restart?: boolean) {
  return writeTerminalTab(tab, (restart ? '\u0003' : '') + command + os.EOL)
}

export function closeTerminalTab(tab: TerminalTab) {
  if (tab.pane) {
    removeTerminalTab(tab)
  } else {
    return ipcRenderer.invoke('close-terminal', tab.pid)
  }
}

function releaseTabPosition(tab: TerminalTab, groupTabs: TerminalTab[]) {
  const position = tab.position
  if (!position) return
  if (groupTabs.length <= 1) {
    groupTabs.forEach(item => {
      delete item.position
    })
    return
  }
  const leftTabs = groupTabs.filter(item => {
    return item.position
      && item.position.row >= position.row
      && item.position.row + (item.position.rowspan ?? 1) <= position.row + (position.rowspan ?? 1)
      && item.position.col + (item.position.colspan ?? 1) === position.col
  })
  if (leftTabs.length) {
    leftTabs.forEach(item => {
      item.position!.colspan = (item.position!.colspan ?? 1) + (position.colspan ?? 1)
    })
    return
  }
  const rightTabs = groupTabs.filter(item => {
    return item.position
      && item.position.row >= position.row
      && item.position.row + (item.position.rowspan ?? 1) <= position.row + (position.rowspan ?? 1)
      && item.position.col === position.col + (position.colspan ?? 1)
  })
  if (rightTabs.length) {
    rightTabs.forEach(item => {
      item.position!.col -= (position.colspan ?? 1)
      item.position!.colspan = (item.position!.colspan ?? 1) + (position.colspan ?? 1)
    })
    return
  }
  const topTabs = groupTabs.filter(item => {
    return item.position
      && item.position.col >= position.col
      && item.position.col + (item.position.colspan ?? 1) <= position.col + (position.colspan ?? 1)
      && item.position.row + (item.position.rowspan ?? 1) === position.row
  })
  if (topTabs.length) {
    topTabs.forEach(item => {
      item.position!.rowspan = (item.position!.rowspan ?? 1) + (position.rowspan ?? 1)
    })
    return
  }
  const bottomTabs = groupTabs.filter(item => {
    return item.position
      && item.position.col >= position.col
      && item.position.col + (item.position.colspan ?? 1) <= position.col + (position.colspan ?? 1)
      && item.position.row === position.row + (position.rowspan ?? 1)
  })
  if (bottomTabs.length) {
    bottomTabs.forEach(item => {
      item.position!.row -= (position.rowspan ?? 1)
      item.position!.rowspan = (item.position!.rowspan ?? 1) + (position.rowspan ?? 1)
    })
    return
  }
}

function reflowTabGroup(groupTabs: TerminalTab[]) {
  if (groupTabs.length <= 1) {
    groupTabs.forEach(tab => {
      delete tab.position
    })
    return
  }
  const rows = groupTabs.map(tab => tab.position!.row)
  for (const row of new Set(rows)) {
    const rowTabs = groupTabs.filter(tab => tab.position!.row === row)
    const colspans = rowTabs.map(tab => tab.position!.colspan ?? 1)
    if (new Set(colspans).size === 1 && colspans.every(value => value > 1)) {
      rowTabs.forEach(tab => {
        delete tab.position!.colspan
      })
    }
  }
  const cols = groupTabs.map(tab => tab.position!.col)
  for (const col of new Set(cols)) {
    const colTabs = groupTabs.filter(tab => tab.position!.col === col)
    const rowspans = colTabs.map(tab => tab.position!.rowspan ?? 1)
    if (new Set(rowspans).size === 1 && rowspans.every(value => value > 1)) {
      colTabs.forEach(tab => {
        delete tab.position!.rowspan
      })
    }
  }
}

export async function removeTerminalTab(tab: TerminalTab) {
  const index = getTerminalTabIndex(tab)
  tabs.splice(index, 1)
  const groupTabs = tab.group ? getTerminalTabsByGroup(tab.group) : []
  if (!tabs.length) {
    window.close()
  } else if (activeIndex > index) {
    activeIndex -= 1
  } else if (activeIndex === index) {
    const currentTabs = groupTabs.length ? groupTabs : tabs
    activeIndex = getTerminalTabIndex(currentTabs[currentTabs.length - 1])
  }
  if (tab.group) {
    releaseTabPosition(tab, groupTabs)
    reflowTabGroup(groupTabs)
  }
}

export function activateTerminalTab(tab: TerminalTab) {
  const index = getTerminalTabIndex(tab)
  if (index !== -1) {
    activeIndex = index
  }
}

export function activateOrAddTerminalTab(tab: TerminalTab) {
  const index = getTerminalTabIndex(tab)
  if (index !== -1) {
    activeIndex = index
  } else {
    const targetIndex = activeIndex + 1
    tabs.splice(targetIndex, 0, tab)
    activeIndex = targetIndex
  }
}

export function moveTerminalTab(tab: TerminalTab, index: number) {
  const fromIndex = tabs.indexOf(tab)
  if (fromIndex < index) {
    tabs.splice(index + 1, 0, tab)
    tabs.splice(fromIndex, 1)
  } else {
    tabs.splice(fromIndex, 1)
    tabs.splice(index, 0, tab)
  }
  if (activeIndex === fromIndex) {
    activeIndex = index
  } else if (activeIndex > fromIndex && activeIndex < index) {
    activeIndex -= 1
  } else if (activeIndex < fromIndex && activeIndex > index) {
    activeIndex += 1
  }
}

export function cancelTerminalTabGrouping(tab: TerminalTab) {
  if (!tab.group) return
  const group = tab.group
  delete tab.group
  const groupTabs = getTerminalTabsByGroup(group)
  releaseTabPosition(tab, groupTabs)
  delete tab.position
  reflowTabGroup(groupTabs)
}

export type TerminalTabDirection = 'left' | 'right' | 'top' | 'bottom'

export function appendTerminalTab(tab: TerminalTab, fromIndex: number, direction: TerminalTabDirection = 'right') {
  const movingTab = tabs[fromIndex]
  cancelTerminalTabGrouping(movingTab)
  if (!tab.group) {
    tab.group = {
      type: 'default',
      id: getTerminalTabID(tab),
    }
  }
  if (!tab.position) {
    tab.position = { row: 0, col: 0 }
  }
  movingTab.group = tab.group
  switch (direction) {
    case 'left':
      movingTab.position = {
        row: tab.position.row,
        col: tab.position.col,
        rowspan: tab.position.rowspan,
      }
      if (!tab.position.colspan || tab.position.colspan <= 1) {
        tab.position.col += 1
      }
      break
    case 'right':
      movingTab.position = {
        row: tab.position.row,
        col: tab.position.col + (tab.position.colspan ? tab.position.colspan - 1 : 1),
        rowspan: tab.position.rowspan,
      }
      break
    case 'top':
      movingTab.position = {
        row: tab.position.row,
        col: tab.position.col,
        colspan: tab.position.colspan,
      }
      if (!tab.position.rowspan || tab.position.rowspan <= 1) {
        tab.position.row += 1
      }
      break
    case 'bottom':
      movingTab.position = {
        row: tab.position.row + (tab.position.rowspan ? tab.position.rowspan - 1 : 1),
        col: tab.position.col,
        colspan: tab.position.colspan,
      }
      break
  }
  const groupTabs = getTerminalTabsByGroup(tab.group)
  switch (direction) {
    case 'left':
    case 'right': {
      if (tab.position.colspan && tab.position.colspan > 1) {
        tab.position.colspan -= 1
        return
      }
      const position = movingTab.position!
      const columnTabs = groupTabs.filter(item => {
        return item.position
          && item.position.row !== position.row
          && item.position.col <= position.col
          && item.position.col + (item.position.colspan ?? 1) >= position.col
      })
      columnTabs.forEach(item => {
        item.position!.colspan = (item.position!.colspan ?? 1) + 1
      })
      break
    }
    case 'top':
    case 'bottom': {
      if (tab.position.rowspan && tab.position.rowspan > 1) {
        tab.position.rowspan -= 1
        return
      }
      const position = movingTab.position!
      const rowTabs = groupTabs.filter(item => {
        return item.position
          && item.position.col !== position.col
          && item.position.row <= position.row
          && item.position.row + (item.position.rowspan ?? 1) >= position.row
      })
      rowTabs.forEach(item => {
        item.position!.rowspan = (item.position!.rowspan ?? 1) + 1
      })
      break
    }
  }
}

export async function splitTerminalTab(tab: TerminalTab) {
  if (tab.pane) return tab
  const newTab = await createTerminalTab(tab)
  appendTerminalTab(tab, getTerminalTabIndex(newTab))
  return newTab
}
