import * as os from 'node:os'
import type { Edge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { useResizeObserver } from '@vueuse/core'
import { CanvasAddon } from '@xterm/addon-canvas'
import { FitAddon } from '@xterm/addon-fit'
import { ImageAddon } from '@xterm/addon-image'
import { LigaturesAddon } from '@xterm/addon-ligatures'
import { SearchAddon } from '@xterm/addon-search'
import { SerializeAddon } from '@xterm/addon-serialize'
import { Unicode11Addon } from '@xterm/addon-unicode11'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { WebglAddon } from '@xterm/addon-webgl'
import type { IMarker, ITerminalOptions } from '@xterm/xterm'
import { Terminal } from '@xterm/xterm'
import { shell } from 'electron'
import { toKeyEvent } from 'keyboardevent-from-electron-accelerator'
import { isMatch, trim } from 'lodash'
import type { MaybeRefOrGetter } from 'vue'
import { effectScope, markRaw, nextTick, reactive, shallowReactive, toRaw, toValue, watch, watchEffect } from 'vue'
import { ipcRenderer } from '@commas/electron-ipc'
import type { KeyBindingCommand, MenuItem } from '@commas/types/menu'
import type { ReadonlyTerminalTabAddons, TerminalContext, TerminalTab, TerminalTabCharacter, TerminalTabCharacterCommand } from '@commas/types/terminal'
import * as commas from '../../api/core-renderer'
import { createIDGenerator } from '../../shared/helper'
import { openContextMenu } from '../utils/frame'
import { translate } from '../utils/i18n'
import { handleRenderer } from '../utils/ipc'
import { ShellIntegrationAddon } from '../utils/shell-integration'
import { getProcessName, getPrompt, getTerminalTabID, getWindowsProcessInfo } from '../utils/terminal'
import { useA11yEnabled } from './a11y'
import { useKeyBindings } from './keybinding'
import { useSettings } from './settings'
import { useTheme } from './theme'

declare module '@commas/api/modules/app' {
  export interface Events {
    'terminal.addons-loaded': [TerminalTab],
  }
}

declare module '@commas/electron-ipc' {
  export interface RendererEvents {
    'open-tab': (context?: Partial<TerminalContext>, options?: CreateTerminalTabOptions) => void,
    'duplicate-tab': (data?: Pick<TerminalTab, 'pid'>) => void,
    'split-tab': (data?: Pick<TerminalTab, 'pid'>) => void,
    'close-tab': (data?: Pick<TerminalTab, 'pid'>) => void,
    'input-terminal': (data: Pick<TerminalTab, 'pid' | 'process'> & { data: string }) => void,
    'exit-terminal': (data: Pick<TerminalTab, 'pid'>) => void,
    'clear-terminal': () => void,
    'close-terminal': () => void,
    'execute-terminal': (command: string, restart?: boolean) => void,
    'select-tab': (index: number) => void,
    'select-previous-tab': () => void,
    'select-next-tab': () => void,
    'scroll-to-command': (offset: number) => void,
    'go-back': () => void,
    'go-forward': () => void,
    'show-tab-options': () => void,
    'open-url': (address: string) => void,
    save: () => void,
    copy: (text: string) => void,
    'open-pane': (name: string) => void,
  }
  export interface RendererCommands {
    'get-history': (count?: number) => string[],
  }
}

declare module '@commas/types/menu' {
  export interface XtermEvents {
    'xterm:input': (...args: string[]) => void,
    'xterm:completion': () => void,
  }
}

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

let paneTabURL = $ref('')
export function usePaneTabURL() {
  return $$(paneTabURL)
}

let isGroupSeparating = $ref(false)
export function useTerminalTabGroupSeparating() {
  return $$(isGroupSeparating)
}

export function getTerminalTabIndex(tab: TerminalTab) {
  return tabs.indexOf(toRaw(tab))
}

export function getTerminalTabsByGroup(group: NonNullable<TerminalTab['group']>) {
  return tabs.filter(tab => tab.group === group)
}

export function getTerminalTabsByCharacter(character: TerminalTabCharacter) {
  return tabs.filter(tab => tab.character?.type === character.type && tab.character.id === character.id)
}

interface TerminalTabCategory {
  items: {
    tab?: TerminalTab | undefined,
    character?: TerminalTabCharacter | undefined,
    command?: TerminalTabCharacterCommand,
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
            return category.characters
              .some(character => tab.character?.type === character.type && tab.character.id === character.id)
          })
        })
        .map(tab => ({ tab, character: tab.character })),
    },
    ...orderedCategories.map<TerminalTabCategory>(category => {
      return {
        items: category.characters.flatMap(character => {
          const characterTabs = getTerminalTabsByCharacter(character)
          return characterTabs.length
            ? characterTabs.map(tab => ({ tab, character, command: category.command }))
            : { character, command: category.command }
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

const readonlyTerminalOptions = $computed<Partial<ITerminalOptions>>(() => {
  return {
    allowProposedApi: true,
    allowTransparency: theme.opacity < 1,
    cursorStyle: settings['terminal.style.cursorStyle'],
    fontFamily: settings['terminal.style.fontFamily'],
    fontSize: settings['terminal.style.fontSize'],
    // FIXME: don't know why
    lineHeight: settings['terminal.style.lineHeight'] / 1.2,
    screenReaderMode: a11yEnabled,
    theme: { ...theme },
  }
})

const interactiveTerminalOptions = $computed<Partial<ITerminalOptions>>(() => {
  return {
    linkHandler: {
      activate: handleTerminalLink,
    },
    overviewRulerWidth: 16,
  }
})

const terminalOptions = $computed(() => ({
  ...readonlyTerminalOptions,
  ...interactiveTerminalOptions,
}))

const stickyTerminalOptions = $computed(() => ({
  ...readonlyTerminalOptions,
  disableStdin: true,
}))

type RendererKeyBinding = KeyBindingCommand & {
  pattern: Partial<KeyboardEvent>,
}

const keybindings = $(useKeyBindings())
const rendererKeybindings = $computed(() => {
  return keybindings.map<RendererKeyBinding>(binding => {
    const pattern = toKeyEvent(binding.accelerator)
    if (pattern.code) {
      delete pattern.key
    }
    return {
      pattern: {
        ...pattern,
        type: binding.when ?? 'keydown',
      },
      command: binding.command as never,
      args: binding.args as never,
    }
  })
})

export interface CreateTerminalTabOptions {
  command?: string,
  character?: TerminalTabCharacter,
}

export async function createTerminalTab(context: Partial<TerminalContext> = {}, {
  command,
  character,
}: CreateTerminalTabOptions = {}) {
  const info = await ipcRenderer.invoke('create-terminal', {
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
    state: {
      open: Promise.withResolvers(),
      stop: Promise.withResolvers(),
    },
    alerting: false,
    thumbnail: '',
    character,
  })
  xterm.attachCustomKeyEventHandler(event => {
    // Support shortcuts on Windows
    if (process.platform === 'win32' && event.ctrlKey) {
      if (event.key === 'c' && xterm.hasSelection()) return false
      if (event.key === 'f') return false
    }
    const shellIntegration = tab.addons.shellIntegration
    if (shellIntegration) {
      const defaultProcessed = shellIntegration.handleCustomKeyEvent(event)
      if (typeof defaultProcessed === 'boolean') return defaultProcessed
    }
    const matchedItem = rendererKeybindings.find(item => isMatch(event, item.pattern))
    if (!matchedItem) return true
    switch (matchedItem.command) {
      case 'xterm:input': {
        tab.xterm.input(matchedItem.args ? matchedItem.args.join('') : '')
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
    ipcRenderer.invoke('write-terminal', pid, data)
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
  let latestPromise: Promise<string>
  xterm.onLineFeed(async () => {
    if (settings['terminal.tab.liveCwd'] && !settings['terminal.shell.integration']) {
      const promise = ipcRenderer.invoke('get-terminal-cwd', tab.pid)
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
  const stickyXterm = settings['terminal.shell.integration'] && settings['terminal.shell.stickyScroll']
    ? new Terminal(stickyTerminalOptions)
    : undefined
  if (stickyXterm) {
    tab.stickyXterm = stickyXterm
    tab.stickyAddons = shallowReactive<any>({})
  }
  const scope = effectScope()
  scope.run(() => {
    watchEffect(() => {
      for (const [key, value] of Object.entries(terminalOptions)) {
        xterm.options[key] = value
      }
      loadTerminalAddons(tab)
    })
    if (stickyXterm) {
      watchEffect(() => {
        for (const [key, value] of Object.entries(stickyTerminalOptions)) {
          stickyXterm.options[key] = value
        }
        loadStickyTerminalAddons(tab)
      })
    }
  })
  tab.state.stop.promise.then(() => {
    scope.stop()
  })
  if (command) {
    executeTerminalTab(tab, command)
  }
  const targetIndex = activeIndex + 1
  tabs.splice(targetIndex, 0, tab)
  activeIndex = targetIndex
  return tab
}

export function useTerminalElement(
  element: MaybeRefOrGetter<HTMLElement | undefined>,
  terminal: MaybeRefOrGetter<Terminal>,
  addons: MaybeRefOrGetter<ReadonlyTerminalTabAddons>,
  onInitialize?: (xterm: Terminal) => void,
) {
  useResizeObserver(element, () => {
    if (toValue(terminal).element?.clientWidth) {
      toValue(addons).fit.fit()
    }
  })
  return watchEffect(() => {
    const el = toValue(element)
    if (!el) return
    const xterm = toValue(terminal)
    if (xterm.element) return
    xterm.open(el)
    onInitialize?.(xterm)
  })
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
  if (tab.character?.title) {
    return tab.character.title
  }
  if (tab.title && (tab.pane || process.platform !== 'win32')) {
    return tab.title
  }
  if (tab.pane && !tab.shell) {
    return translate(tab.pane.title)
  }
  const expr = settings['terminal.tab.titleFormat']
  return getPrompt(expr, tab) || getProcessName(tab)
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
      if (!type || item.character?.type === type) {
        if (item.tab && toRaw(item.tab) === toRaw(currentTerminal)) {
          defaultIndex = options.length
        }
        options.push({
          type: index ? 'checkbox' : 'normal',
          label: item.tab ? getTerminalTabTitle(item.tab) : item.character?.title,
          args: item.tab ? [currentIndex] : [item.character] as never,
          command: item.tab ? 'select-tab' : item.command as never,
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
  ipcRenderer.on('open-tab', (event, context, options) => {
    createTerminalTab(context, options)
  })
  ipcRenderer.on('duplicate-tab', (event, data) => {
    const tab = data ? tabs.find(item => item.pid === data.pid) : currentTerminal
    if (!tab) return
    createTerminalTab(tab)
  })
  ipcRenderer.on('split-tab', (event, data) => {
    const tab = data ? tabs.find(item => item.pid === data.pid) : currentTerminal
    if (!tab) return
    splitTerminalTab(tab)
  })
  ipcRenderer.on('close-tab', (event, data) => {
    const tab = data ? tabs.find(item => item.pid === data.pid) : currentTerminal
    if (tab) {
      closeTerminalTab(tab)
    }
  })
  ipcRenderer.on('input-terminal', (event, data) => {
    const tab = tabs.find(item => item.pid === data.pid)
    if (!tab) return
    const xterm = tab.xterm
    xterm.write(data.data, () => {
      const activeBuffer = xterm.buffer.active
      let thumbnail: string | undefined
      const startY = tab.addons.shellIntegration?.currentCommand?.marker.line ?? -1
      for (let y = activeBuffer.baseY + activeBuffer.cursorY; y > startY; y -= 1) {
        thumbnail = activeBuffer.getLine(y)?.translateToString(true)
        if (thumbnail) break
      }
      tab.thumbnail = thumbnail
    })
    // data.process on Windows will be always equivalent to pty.name
    // TODO: confirm after 1.0.0
    if (process.platform !== 'win32') {
      tab.process = data.process
    }
  })
  ipcRenderer.on('exit-terminal', (event, data) => {
    const tab = tabs.find(item => item.pid === data.pid)
    if (!tab) return
    tab.state.stop.resolve()
    // FIXME: renderer cannot dispose correctly since the `dispose` will set a new DomRenderer
    // which could not be finished when the terminal is disposed
    if (tab.addons.webgl) {
      tab.addons.webgl.dispose()
      delete tab.addons.webgl
    }
    if (tab.addons.canvas) {
      tab.addons.canvas.dispose()
      delete tab.addons.canvas
    }
    const xterm = tab.xterm
    // FIXME: clear paused resize task manually to remove renderer as dependency
    xterm['_core']._renderService._pausedResizeTask.set(() => {})
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
  ipcRenderer.on('execute-terminal', (event, command, restart) => {
    if (!currentTerminal) return
    executeTerminalTab(currentTerminal, command, restart)
  })
  ipcRenderer.on('select-tab', (event, index) => {
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
  ipcRenderer.on('scroll-to-command', (event, offset) => {
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
  ipcRenderer.on('open-url', (event, address) => {
    const url = new URL(address)
    const paths = trim(url.pathname, '/').split('/')
    commas.proxy.workspace.openPaneTab(paths[0])
    paneTabURL = address
  })
  ipcRenderer.on('save', () => {
    if (!currentTerminal) return
    currentTerminal.pane?.instance?.save?.()
  })
  ipcRenderer.on('open-pane', (event, name) => {
    commas.proxy.workspace.openPaneTab(name)
  })
  handleRenderer('get-history', (event, count) => {
    if (!currentTerminal) return []
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    const commands = currentTerminal.addons?.shellIntegration?.commands
      .filter(item => item.exitCode === 0)
      .map(item => item.command)
      .filter((command): command is string => Boolean(command))
      ?? []
    return count ? commands.slice(0 - count) : commands
  })
}

function loadReadOnlyTerminalAddons(tab: TerminalTab, xterm: Terminal, addons: Record<string, any>) {
  if (!addons.fit) {
    addons.fit = new FitAddon()
    xterm.loadAddon(addons.fit)
    tab.state.open.promise.then(() => {
      addons.fit.fit()
    })
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
      tab.state.open.promise.then(() => {
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
  const rendererType = settings['terminal.view.rendererType']
  if (rendererType === 'webgl') {
    if (!addons.webgl) {
      addons.webgl = new WebglAddon()
      tab.state.open.promise.then(() => {
        xterm.loadAddon(addons.webgl)
      })
    }
  } else {
    if (addons.webgl) {
      addons.webgl.dispose()
      delete addons.webgl
    }
  }
  if (rendererType === 'canvas') {
    if (!addons.canvas) {
      addons.canvas = new CanvasAddon()
      tab.state.open.promise.then(() => {
        xterm.loadAddon(addons.canvas)
      })
    }
  } else {
    if (addons.canvas) {
      addons.canvas.dispose()
      delete addons.canvas
    }
  }
  if (!addons.serialize) {
    addons.serialize = new SerializeAddon()
    xterm.loadAddon(addons.serialize)
  }
}

function loadInteractiveTerminalAddons(tab: TerminalTab, xterm: Terminal, addons: Record<string, any>) {
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
  if (!addons.search) {
    addons.search = new SearchAddon()
    xterm.loadAddon(addons.search)
  }
  if (!addons.weblinks) {
    addons.weblinks = new WebLinksAddon(handleTerminalLink)
    xterm.loadAddon(addons.weblinks)
  }
  if (!addons.image) {
    addons.image = new ImageAddon()
    xterm.loadAddon(addons.image)
  }
}

function loadTerminalAddons(tab: TerminalTab) {
  const xterm = tab.xterm
  const addons: Record<string, any> = tab.addons
  loadReadOnlyTerminalAddons(tab, xterm, addons)
  loadInteractiveTerminalAddons(tab, xterm, addons)
  commas.proxy.app.events.emit('terminal.addons-loaded', tab)
}

function loadStickyTerminalAddons(tab: TerminalTab) {
  const xterm = tab.stickyXterm!
  const addons: Record<string, any> = tab.stickyAddons!
  loadReadOnlyTerminalAddons(tab, xterm, addons)
}

export function executeTerminalTab(tab: TerminalTab, command: string, restart?: boolean) {
  tab.command = command
  if (restart) {
    tab.xterm.input('\u0003')
  }
  if (tab.xterm.element) {
    tab.xterm.paste(command)
  } else {
    tab.xterm.input(command)
  }
  tab.xterm.input(os.EOL)
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
      delete item.group
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

export function moveTerminalTab(tab: TerminalTab, index: number, edge?: 'start' | 'end') {
  const fromIndex = tabs.indexOf(tab)
  if (fromIndex === index) return
  let targetIndex = index
  if (fromIndex < index) {
    targetIndex = edge === 'start' ? index - 1 : index
    tabs.splice(targetIndex + 1, 0, tab)
    tabs.splice(fromIndex, 1)
  } else {
    targetIndex = edge === 'end' ? index + 1 : index
    tabs.splice(fromIndex, 1)
    tabs.splice(targetIndex, 0, tab)
  }
  if (activeIndex === fromIndex) {
    activeIndex = targetIndex
  } else if (activeIndex > fromIndex && activeIndex < targetIndex) {
    activeIndex -= 1
  } else if (activeIndex < fromIndex && activeIndex > targetIndex) {
    activeIndex += 1
  }
}

export function separateTerminalTabGroup(tab: TerminalTab) {
  if (!tab.group) return
  const group = tab.group
  delete tab.group
  const groupTabs = getTerminalTabsByGroup(group)
  releaseTabPosition(tab, groupTabs)
  delete tab.position
  reflowTabGroup(groupTabs)
}

const generateGroup = createIDGenerator()

export function appendTerminalTab(tab: TerminalTab, fromIndex: number, direction?: Edge | null) {
  const movingTab = tabs[fromIndex]
  separateTerminalTabGroup(movingTab)
  if (!tab.group) {
    tab.group = generateGroup()
  }
  if (!tab.position) {
    tab.position = { row: 0, col: 0 }
  }
  movingTab.group = tab.group
  switch (direction) {
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
    default:
      movingTab.position = {
        row: tab.position.row,
        col: tab.position.col + (tab.position.colspan ? tab.position.colspan - 1 : 1),
        rowspan: tab.position.rowspan,
      }
      break
  }
  const groupTabs = getTerminalTabsByGroup(tab.group)
  switch (direction) {
    case 'top':
    case 'bottom': {
      if (tab.position.rowspan && tab.position.rowspan > 1) {
        tab.position.rowspan -= 1
        return
      }
      const position = movingTab.position
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
    case 'left':
    case 'right':
    default: {
      if (tab.position.colspan && tab.position.colspan > 1) {
        tab.position.colspan -= 1
        return
      }
      const position = movingTab.position
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
  }
}

export async function splitTerminalTab(tab: TerminalTab) {
  if (tab.pane) return tab
  const newTab = await createTerminalTab(tab)
  appendTerminalTab(tab, getTerminalTabIndex(newTab))
  return newTab
}
