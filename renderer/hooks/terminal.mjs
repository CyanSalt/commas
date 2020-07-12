import { ipcRenderer, shell } from 'electron'
import { ref, computed, unref, markRaw, reactive, toRaw, watch, watchEffect } from 'vue'
import { memoize, debounce } from 'lodash-es'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from 'xterm-addon-search'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { Unicode11Addon } from 'xterm-addon-unicode11'
import { LigaturesAddon } from 'xterm-addon-ligatures'
import { useRemoteData } from './remote'
import { useSettings } from './settings'
import { useTheme } from './theme'
import { getWindowsProcessInfo } from '../utils/terminal'

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

/**
 * @param {object} [options]
 * @param {string=} options.cwd
 * @param {string=} options.shell
 * @param {number=} options.launcher
 */
export async function createTerminalTab({ cwd, shell, launcher } = {}) {
  const info = await ipcRenderer.invoke('create-terminal', { cwd, shell })
  const themeRef = useTheme()
  const theme = unref(themeRef)
  const xterm = new Terminal({
    allowTransparency: true,
    theme,
  })
  const tab = reactive({
    ...info,
    title: '',
    xterm: markRaw(xterm),
    addons: markRaw({}),
    launcher,
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
      const cwd = await ipcRenderer.invoke('get-terminal-cwd', tab.pid)
      if (cwd) tab.cwd = cwd
    }
  }, 250)
  xterm.onKey(({ key, domEvent }) => {
    if (domEvent.key === 'Enter') updateCwd()
  })
  watchEffect(() => {
    const settingsRef = useSettings()
    const settings = unref(settingsRef)
    if (tab.pane) return
    const xterm = tab.xterm
    xterm.setOption('fontSize', settings['terminal.style.fontSize'])
    xterm.setOption('fontFamily', settings['terminal.style.fontFamily'])
    // TODO: unload when settings disabled
    if (settings['terminal.style.fontLigatures']) {
      if (xterm.element && !tab.addons.ligatures) {
        tab.addons.ligatures = new LigaturesAddon()
        xterm.loadAddon(tab.addons.ligatures)
      }
    }
  })
  watch(themeRef, theme => {
    if (tab.pane) return
    const xterm = tab.xterm
    xterm.setOption('theme', theme)
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
  ipcRenderer.on('activate-previous-tab', () => {
    const activeIndex = unref(activeIndexRef)
    if (activeIndex > 0) {
      activeIndexRef.value = activeIndex - 1
    }
  })
  ipcRenderer.on('activate-next-tab', () => {
    const activeIndex = unref(activeIndexRef)
    const tabs = unref(tabsRef)
    if (activeIndex < tabs.length - 1) {
      activeIndexRef.value = activeIndex + 1
    }
  })
}

/**
 * @param {TerminalTab} tab
 * @param {HTMLElement} element
 */
export function mountTerminalTab(tab, element) {
  const settings = unref(useSettings())
  const xterm = tab.xterm
  xterm.open(element)
  tab.addons.fit = new FitAddon()
  xterm.loadAddon(tab.addons.fit)
  tab.addons.search = new SearchAddon()
  xterm.loadAddon(tab.addons.search)
  xterm.loadAddon(new WebLinksAddon((event, uri) => {
    const shouldOpen = settings['terminal.link.modifier'] === 'Alt' ? event.altKey
      : (process.platform === 'darwin' ? event.metaKey : event.ctrlKey)
    if (shouldOpen) shell.openExternal(uri)
  }))
  xterm.loadAddon(new Unicode11Addon())
  xterm.unicode.activeVersion = '11'
  if (settings['terminal.style.fontLigatures']) {
    tab.addons.ligatures = new LigaturesAddon()
    xterm.loadAddon(tab.addons.ligatures)
  }
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
