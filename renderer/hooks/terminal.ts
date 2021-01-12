import { ipcRenderer, shell } from 'electron'
import { memoize, debounce, isMatch } from 'lodash-es'
import { ref, computed, unref, markRaw, reactive, toRaw, watch } from 'vue'
import type { ITerminalOptions } from 'xterm'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { LigaturesAddon } from 'xterm-addon-ligatures'
import { SearchAddon } from 'xterm-addon-search'
import { Unicode11Addon } from 'xterm-addon-unicode11'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { WebglAddon } from 'xterm-addon-webgl'
import type { TerminalInfo, TerminalTab } from '../../typings/terminal'
import { toKeyEventPattern } from '../utils/accelerator'
import { openContextMenu } from '../utils/frame'
import { getPrompt, getWindowsProcessInfo } from '../utils/terminal'
import { useKeyBindings } from './keybinding'
import { getLauncherByTerminalTab } from './launcher'
import { useRemoteData } from './remote'
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

export function useCurrentTerminal() {
  return computed(() => {
    const activeIndex = unref(activeIndexRef)
    if (activeIndex === -1) return null
    const tabs = unref(tabsRef)
    return tabs[activeIndex]
  })
}

export function getTerminalTabIndex(tab: TerminalTab) {
  const tabs = unref(tabsRef)
  return tabs.indexOf(toRaw(tab))
}

export const useTerminalShells = memoize(() => {
  return useRemoteData<string[]>([], {
    getter: 'get-shells',
  })
})

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
}

export async function createTerminalTab({ cwd, shell: shellPath, launcher }: CreateTerminalTabOptions = {}) {
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
        const data = matchedItem.args ? matchedItem.args.map(value => {
          return typeof value === 'number'
            ? String.fromCharCode(value) : String(value)
        }) : []
        writeTerminalTab(tab, data.join(''))
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
  watch(terminalOptionsRef, (terminalOptions) => {
    const latestXterm = tab.xterm
    for (const [key, value] of Object.entries(terminalOptions)) {
      latestXterm.setOption(key, value)
    }
    loadTerminalAddons(tab)
  })
  const tabs = unref(tabsRef)
  tabs.push(tab)
  activeIndexRef.value = tabs.length - 1
}

const createResizingObserver = memoize(() => {
  return new ResizeObserver(debounce(() => {
    const tab = unref(useCurrentTerminal())
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (tab?.xterm?.element) {
      tab.addons.fit.fit()
    }
  }, 250))
})

function getTerminalTabTitle(tab: TerminalTab) {
  if (tab.pane) {
    return tab.pane.title
  }
  const launcher = getLauncherByTerminalTab(tab)
  if (launcher) {
    return launcher.name
  }
  if (process.platform !== 'win32' && tab.title) {
    return tab.title
  }
  const settingsRef = useSettings()
  const settings = unref(settingsRef)
  const expr = settings['terminal.tab.titleFormat']
  return getPrompt(expr, tab) || tab.process
}

export function handleTerminalMessages() {
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
      const observer: ReturnType<typeof createResizingObserver> | undefined = createResizingObserver.cache.get(undefined)
      if (observer) observer.unobserve(xterm.element)
    }
    xterm.dispose()
    removeTerminalTab(tab)
  })
  ipcRenderer.on('clear-terminal', () => {
    const tab = unref(useCurrentTerminal())
    if (!tab) return
    const xterm = tab.xterm
    xterm.clear()
  })
  ipcRenderer.on('close-terminal', () => {
    const tab = unref(useCurrentTerminal())
    if (!tab) return
    closeTerminalTab(tab)
  })
  ipcRenderer.on('select-tab', (event, args: { index: number }) => {
    activeIndexRef.value = args.index
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
  ipcRenderer.on('show-tab-options', () => {
    const tabs = unref(tabsRef)
    const activeIndex = unref(activeIndexRef)
    openContextMenu(tabs.map((tab, index) => {
      const number = index + 1
      return {
        label: getTerminalTabTitle(tab),
        command: 'select-tab',
        accelerator: number < 10 ? String(number) : undefined,
        args: {
          index,
        },
      }
    }), [0, 36], activeIndex)
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
  const observer = createResizingObserver()
  observer.observe(element)
  tab.addons.fit.fit()
  xterm.focus()
}

export function writeTerminalTab(tab: TerminalTab, data: string) {
  return ipcRenderer.invoke('write-terminal', tab.pid, data)
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
