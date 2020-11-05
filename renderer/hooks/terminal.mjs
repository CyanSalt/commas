import { ipcRenderer, shell } from 'electron'
import { memoize, debounce, isMatch } from 'lodash-es'
import { ref, computed, unref, markRaw, reactive, toRaw, watch } from 'vue'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { LigaturesAddon } from 'xterm-addon-ligatures'
import { SearchAddon } from 'xterm-addon-search'
import { Unicode11Addon } from 'xterm-addon-unicode11'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { WebglAddon } from 'xterm-addon-webgl'
import { toKeyEventPattern } from '../utils/accelerator.mjs'
import { getWindowsProcessInfo } from '../utils/terminal.mjs'
import { useKeyBindings } from './keybinding.mjs'
import { useRemoteData } from './remote.mjs'
import { useSettings } from './settings.mjs'
import { useTheme } from './theme.mjs'

/**
 * @typedef {import('../utils/terminal').TerminalTab} TerminalTab
 */

/**
 * @types {Ref<TerminalTab[]>}
 */
const tabsRef = ref([])
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

/**
 * @param {TerminalTab} tab
 */
export function getTerminalTabIndex(tab) {
  const tabs = unref(tabsRef)
  return tabs.indexOf(toRaw(tab))
}

/**
 * @returns {Promise<string[]>}
 */
export const useTerminalShells = memoize(() => {
  return useRemoteData([], {
    getter: 'get-shells',
  })
})

const terminalOptionsRef = computed(() => {
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

const keybindingsRef = computed(() => {
  const keybindings = unref(useKeyBindings())
  return keybindings.map(binding => ({
    pattern: {
      ...toKeyEventPattern(binding.accelerator),
      type: binding.when || 'keydown',
    },
    command: binding.command,
    args: binding.args,
  }))
})

/**
 * @param {object} [options]
 * @param {string=} options.cwd
 * @param {string=} options.shell
 * @param {number=} options.launcher
 */
export async function createTerminalTab({ cwd, shell: shellPath, launcher } = {}) {
  const info = await ipcRenderer.invoke('create-terminal', { cwd, shell: shellPath })
  const xterm = new Terminal(unref(terminalOptionsRef))
  const tab = reactive({
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
        const data = matchedItem.args.map(value => {
          return typeof value === 'number'
            ? String.fromCharCode(value) : String(value)
        })
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
      const latestCwd = await ipcRenderer.invoke('get-terminal-cwd', tab.pid)
      if (latestCwd) tab.cwd = latestCwd
    }
  }, 250)
  xterm.onLineFeed(() => {
    updateCwd()
  })
  watch(terminalOptionsRef, (terminalOptions) => {
    if (tab.pane) return
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
    if (tab && tab.xterm && tab.xterm.element) {
      tab.addons.fit.fit()
    }
  }, 250))
})

export function handleTerminalMessages() {
  ipcRenderer.on('input-terminal', (event, data) => {
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
  ipcRenderer.on('exit-terminal', (event, data) => {
    const tabs = unref(tabsRef)
    const tab = tabs.find(item => item.pid === data.pid)
    if (!tab) return
    const xterm = tab.xterm
    if (xterm.element) {
      const observer = createResizingObserver.cache.get()
      if (observer) observer.unobserve(xterm.element)
    }
    xterm.dispose()
    removeTerminalTab(tab)
  })
  ipcRenderer.on('clear-terminal', () => {
    const tab = unref(useCurrentTerminal())
    const xterm = tab.xterm
    xterm.clear()
  })
  ipcRenderer.on('close-terminal', () => {
    const tab = unref(useCurrentTerminal())
    closeTerminalTab(tab)
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
}

/**
 * @param {TerminalTab} tab
 */
function loadTerminalAddons(tab) {
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

/**
 * @param {TerminalTab} tab
 * @param {HTMLElement} element
 */
export function mountTerminalTab(tab, element) {
  const xterm = tab.xterm
  xterm.open(element)
  loadTerminalAddons(tab)
  const observer = createResizingObserver()
  observer.observe(element)
  tab.addons.fit.fit()
  xterm.focus()
}

/**
 * @param {TerminalTab} tab
 * @param {string} data
 */
export function writeTerminalTab(tab, data) {
  return ipcRenderer.invoke('write-terminal', tab.pid, data)
}

/**
 * @param {TerminalTab} tab
 */
export function closeTerminalTab(tab) {
  if (tab.pane) {
    removeTerminalTab(tab)
  } else {
    return ipcRenderer.invoke('close-terminal', tab.pid)
  }
}

/**
 * @param {TerminalTab} tab
 */
export function removeTerminalTab(tab) {
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

/**
 * @param {TerminalTab} tab
 */
export function activateTerminalTab(tab) {
  const index = getTerminalTabIndex(tab)
  if (index !== -1) {
    activeIndexRef.value = index
  }
}

/**
 * @param {TerminalTab} tab
 */
export function activateOrAddTerminalTab(tab) {
  const index = getTerminalTabIndex(tab)
  if (index !== -1) {
    activeIndexRef.value = index
  } else {
    const tabs = unref(tabsRef)
    activeIndexRef.value = tabs.push(tab) - 1
  }
}

/**
 * @param {TerminalTab} tab
 * @param {number} index
 */
export function moveTerminalTab(tab, index) {
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
