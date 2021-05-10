import * as os from 'os'
import type { MenuItemConstructorOptions } from 'electron'
import { ipcRenderer, shell } from 'electron'
import { memoize, debounce, isMatch, sortBy, groupBy } from 'lodash-es'
import { ref, computed, unref, markRaw, reactive, toRaw, watch } from 'vue'
import type { ITerminalOptions } from 'xterm'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { LigaturesAddon } from 'xterm-addon-ligatures'
import { SearchAddon } from 'xterm-addon-search'
import { Unicode11Addon } from 'xterm-addon-unicode11'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { WebglAddon } from 'xterm-addon-webgl'
import * as commas from '../../api/renderer'
import type { TerminalInfo, TerminalTab } from '../../typings/terminal'
import { toKeyEventPattern } from '../utils/accelerator'
import { openContextMenu } from '../utils/frame'
import { getPrompt, getWindowsProcessInfo } from '../utils/terminal'
import { useKeyBindings } from './keybinding'
import { getLauncherByTerminalTab, useLaunchers } from './launcher'
import { useSettings } from './settings'
import { useTheme } from './theme'

const tabsRef = ref<TerminalTab[]>([])
export function useTerminalTabs() {
  return tabsRef
}

const activeIndexRef = ref(-1)
export function useTerminalActiveIndex() {
  return activeIndexRef
}

const currentTerminalRef = computed(() => {
  const activeIndex = unref(activeIndexRef)
  if (activeIndex === -1) return null
  const tabs = unref(tabsRef)
  return tabs[activeIndex]
})
export function useCurrentTerminal() {
  return currentTerminalRef
}

export function getTerminalTabIndex(tab: TerminalTab) {
  const tabs = unref(tabsRef)
  return tabs.indexOf(toRaw(tab))
}

const terminalOptionsRef = computed<Partial<ITerminalOptions>>(() => {
  const settingsRef = useSettings()
  const themeRef = useTheme()
  const settings = unref(settingsRef)
  const theme = unref(themeRef)
  return {
    rendererType: settings['terminal.renderer.type'] === 'webgl'
      ? 'canvas' : settings['terminal.renderer.type'],
    fontSize: settings['terminal.style.fontSize'],
    fontFamily: settings['terminal.style.fontFamily'],
    allowTransparency: theme.opacity < 1,
    theme,
  }
})

export function useTerminalOptions() {
  return terminalOptionsRef
}

interface RendererKeyBinding {
  pattern: Partial<KeyboardEvent>,
  command: string,
  args?: any[],
}

const keybindingsRef = computed(() => {
  const keybindings = unref(useKeyBindings())
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
  cwd?: string,
  shell?: string,
  launcher?: number,
  command?: string,
}

export async function createTerminalTab({ cwd, shell: shellPath, command, launcher }: CreateTerminalTabOptions = {}) {
  const info: TerminalInfo = await ipcRenderer.invoke('create-terminal', { cwd, shell: shellPath })
  const xterm = new Terminal(unref(terminalOptionsRef))
  const tab = reactive<TerminalTab>({
    ...info,
    title: '',
    xterm: markRaw(xterm),
    addons: markRaw({}),
    launcher,
  })
  xterm.attachCustomKeyEventHandler(event => {
    const keybindings = unref(keybindingsRef)
    const matchedItem = keybindings.find(item => isMatch(event, item.pattern))
    if (!matchedItem) return true
    switch (matchedItem.command) {
      case 'xterm:send': {
        writeTerminalTab(tab, matchedItem.args ? matchedItem.args.join('') : '')
        return false
      }
      default:
        return true
    }
  })
  const pid = info.pid
  // Setup communication between xterm.js and node-pty
  xterm.onData(data => {
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
  const updateCwd = debounce(async () => {
    const settings = unref(useSettings())
    if (settings['terminal.tab.liveCwd']) {
      const latestCwd: string | undefined = await ipcRenderer.invoke('get-terminal-cwd', tab.pid)
      if (latestCwd) tab.cwd = latestCwd
    }
  }, 250)
  xterm.onLineFeed(() => {
    updateCwd()
  })
  xterm.parser.registerOscHandler(539, data => {
    try {
      const argv = JSON.parse(data)
      switch (argv[0]) {
        case 'cli':
          ipcRenderer.invoke('cli', argv.slice(1)).then(result => {
            if (typeof result === 'string') {
              xterm.writeln(result.replace(/(?<!\r)\n/g, '\r\n'))
            }
          }).finally(() => {
            ipcRenderer.invoke('resume-terminal', tab.pid)
          })
          return true
      }
    } catch {
      // ignore error
    }
    ipcRenderer.invoke('resume-terminal', tab.pid)
    return false
  })
  watch(terminalOptionsRef, (terminalOptions) => {
    const latestXterm = tab.xterm
    for (const [key, value] of Object.entries(terminalOptions)) {
      latestXterm.setOption(key, value)
    }
    loadTerminalAddons(tab)
  })
  if (command) {
    executeTerminalTab(tab, command)
  }
  const tabs = unref(tabsRef)
  tabs.push(tab)
  activeIndexRef.value = tabs.length - 1
}

const createResizeObserver = memoize(() => {
  return new ResizeObserver(debounce(() => {
    const tab = unref(currentTerminalRef)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (tab?.xterm?.element) {
      tab.addons.fit.fit()
    }
  }, 250))
})

export function getTerminalTabTitle(tab: TerminalTab) {
  if (tab.pane) {
    return tab.pane.title
  }
  if (process.platform !== 'win32' && tab.title) {
    return tab.title
  }
  const settingsRef = useSettings()
  const settings = unref(settingsRef)
  const expr = settings['terminal.tab.titleFormat']
  return getPrompt(expr, tab) || tab.process
}

function handleTerminalTabHistory() {
  let navigating: number | null = null
  window.addEventListener('popstate', event => {
    if (!event.state) return
    const tabs = unref(tabsRef)
    const targetIndex = tabs.findIndex(item => item.pid === event.state.pid)
    if (targetIndex !== -1) {
      navigating = event.state.pid
      activeIndexRef.value = targetIndex
    }
  })
  watch(currentTerminalRef, (value, oldValue) => {
    if (value && navigating === value.pid) {
      navigating = null
      return
    }
    const state = value ? { pid: value.pid } : null
    if (oldValue && getTerminalTabIndex(oldValue) !== -1) {
      history.pushState(state, '')
    } else {
      history.replaceState(state, '')
    }
  })
}

export function handleTerminalMessages() {
  handleTerminalTabHistory()
  ipcRenderer.on('open-tab', (event, options: CreateTerminalTabOptions) => {
    createTerminalTab(options)
  })
  ipcRenderer.on('duplicate-tab', event => {
    const currentTerminal = unref(currentTerminalRef)
    if (currentTerminal) {
      createTerminalTab({
        cwd: currentTerminal.cwd,
        shell: currentTerminal.shell,
      })
    }
  })
  ipcRenderer.on('close-tab', () => {
    const currentTerminal = unref(currentTerminalRef)
    if (currentTerminal) {
      closeTerminalTab(currentTerminal)
    }
  })
  ipcRenderer.on('input-terminal', (event, data: Pick<TerminalTab, 'pid' | 'process'> & { data: string }) => {
    const tabs = unref(tabsRef)
    const tab = tabs.find(item => item.pid === data.pid)
    if (!tab) return
    const xterm = tab.xterm
    xterm.write(data.data)
    // TODO: performance review
    // data.process on Windows will be always equivalent to pty.name
    if (process.platform !== 'win32') {
      tab.process = data.process
    }
  })
  ipcRenderer.on('exit-terminal', (event, data: Pick<TerminalTab, 'pid'>) => {
    const tabs = unref(tabsRef)
    const tab = tabs.find(item => item.pid === data.pid)
    if (!tab) return
    const xterm = tab.xterm
    if (xterm.element) {
      const observer: ReturnType<typeof createResizeObserver> | undefined = createResizeObserver.cache.get(undefined)
      if (observer) observer.unobserve(xterm.element)
    }
    xterm.dispose()
    removeTerminalTab(tab)
  })
  ipcRenderer.on('clear-terminal', () => {
    const tab = unref(currentTerminalRef)
    if (!tab) return
    const xterm = tab.xterm
    xterm.clear()
  })
  ipcRenderer.on('close-terminal', () => {
    const tab = unref(currentTerminalRef)
    if (!tab) return
    closeTerminalTab(tab)
  })
  ipcRenderer.on('select-tab', (event, index: number) => {
    const tabs = unref(tabsRef)
    if (!tabs.length) return
    let targetIndex = index % tabs.length
    if (targetIndex < 0) targetIndex += tabs.length
    activeIndexRef.value = targetIndex
  })
  ipcRenderer.on('select-previous-tab', () => {
    const activeIndex = unref(activeIndexRef)
    if (activeIndex > 0) {
      activeIndexRef.value = activeIndex - 1
    }
  })
  ipcRenderer.on('select-next-tab', () => {
    const activeIndex = unref(activeIndexRef)
    const tabs = unref(tabsRef)
    if (activeIndex < tabs.length - 1) {
      activeIndexRef.value = activeIndex + 1
    }
  })
  ipcRenderer.on('go-back', () => {
    history.back()
  })
  ipcRenderer.on('go-forward', () => {
    history.forward()
  })
  ipcRenderer.on('show-tab-options', () => {
    const tabs = unref(tabsRef)
    const activeIndex = unref(activeIndexRef)
    const entries = tabs.map((tab, index) => {
      const launcher = getLauncherByTerminalTab(tab)
      return { tab, launcher, index }
    })
    const groups = groupBy(entries, entry => Boolean(entry.launcher)) as Partial<Record<'true' | 'false', typeof entries>>
    const normalTabs = (groups.false ?? []).map(({ tab, index }) => ({
      label: getTerminalTabTitle(tab),
      args: [index],
    }))
    const launchers = unref(useLaunchers())
    const launcherTabs = sortBy(
      groups.true ?? [],
      ({ launcher }) => launchers.findIndex(item => item.id === launcher!.id)
    ).map(({ launcher, index }) => ({
      label: launcher!.name,
      args: [index],
    }))
    const options = [...normalTabs, ...launcherTabs].map<MenuItemConstructorOptions & { args?: any[] }>((item, index) => {
      const number = index + 1
      return {
        ...item,
        command: 'select-tab',
        accelerator: number < 10 ? String(number) : undefined,
      }
    })
    if (groups.false && groups.true) {
      options.splice(groups.false.length, 0, { type: 'separator' })
    }
    openContextMenu(options, [0, 36], options.findIndex(item => item.args?.[0] === activeIndex))
  })
}

export function loadTerminalAddons(tab: TerminalTab) {
  const xterm = tab.xterm
  if (!xterm.element) return
  const settings = unref(useSettings())
  if (!tab.addons.fit) {
    tab.addons.fit = new FitAddon()
    xterm.loadAddon(tab.addons.fit)
  }
  if (!tab.addons.search) {
    tab.addons.search = new SearchAddon()
    xterm.loadAddon(tab.addons.search)
  }
  if (!tab.addons.weblinks) {
    tab.addons.weblinks = new WebLinksAddon((event, uri) => {
      const shouldOpen = settings['terminal.link.modifier'] === 'Alt' ? event.altKey
        : (process.platform === 'darwin' ? event.metaKey : event.ctrlKey)
      if (shouldOpen) shell.openExternal(uri)
    })
    xterm.loadAddon(tab.addons.weblinks)
  }
  if (!tab.addons.unicode11) {
    tab.addons.unicode11 = new Unicode11Addon()
    xterm.loadAddon(tab.addons.unicode11)
    xterm.unicode.activeVersion = '11'
  }
  if (settings['terminal.style.fontLigatures']) {
    if (!tab.addons.ligatures) {
      tab.addons.ligatures = new LigaturesAddon()
      xterm.loadAddon(tab.addons.ligatures)
    }
  } else {
    if (tab.addons.ligatures) {
      tab.addons.ligatures.dispose()
    }
  }
  if (settings['terminal.renderer.type'] === 'webgl') {
    if (!tab.addons.webgl) {
      tab.addons.webgl = new WebglAddon()
      xterm.loadAddon(tab.addons.webgl)
    }
  } else {
    if (tab.addons.webgl) {
      tab.addons.webgl.dispose()
    }
  }
}

export function mountTerminalTab(tab: TerminalTab, element: HTMLElement) {
  const xterm = tab.xterm
  xterm.open(element)
  loadTerminalAddons(tab)
  const observer = createResizeObserver()
  observer.observe(element)
  tab.addons.fit.fit()
  xterm.focus()
  commas.app.events.emit('terminal-tab-mounted', tab)
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

export function removeTerminalTab(tab: TerminalTab) {
  const tabs = unref(tabsRef)
  const index = getTerminalTabIndex(tab)
  tabs.splice(index, 1)
  const length = tabs.length
  if (!length) {
    window.close()
  } else {
    const activeIndex = unref(activeIndexRef)
    activeIndexRef.value = activeIndex > index
      ? activeIndex - 1 : Math.min(index, length - 1)
  }
}

export function activateTerminalTab(tab: TerminalTab) {
  const index = getTerminalTabIndex(tab)
  if (index !== -1) {
    activeIndexRef.value = index
  }
}

export function activateOrAddTerminalTab(tab: TerminalTab) {
  const index = getTerminalTabIndex(tab)
  if (index !== -1) {
    activeIndexRef.value = index
  } else {
    const tabs = unref(tabsRef)
    activeIndexRef.value = tabs.push(tab) - 1
  }
}

export function moveTerminalTab(tab: TerminalTab, index: number) {
  const tabs = unref(tabsRef)
  const activeIndex = unref(activeIndexRef)
  const fromIndex = tabs.indexOf(tab)
  if (fromIndex < index) {
    tabs.splice(index + 1, 0, tab)
    tabs.splice(fromIndex, 1)
  } else {
    tabs.splice(fromIndex, 1)
    tabs.splice(index, 0, tab)
  }
  if (activeIndex === fromIndex) {
    activeIndexRef.value = index
  } else if (activeIndex > fromIndex && activeIndex < index) {
    activeIndexRef.value -= 1
  } else if (activeIndex < fromIndex && activeIndex > index) {
    activeIndexRef.value += 1
  }
}
