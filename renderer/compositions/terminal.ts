import * as os from 'os'
import { clipboard, ipcRenderer, shell } from 'electron'
import { memoize, debounce, findLast, isMatch } from 'lodash-es'
import { markRaw, reactive, toRaw, watch, nextTick } from 'vue'
import { Terminal } from 'xterm'
import type { ITerminalOptions } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { LigaturesAddon } from 'xterm-addon-ligatures'
import { SearchAddon } from 'xterm-addon-search'
import { Unicode11Addon } from 'xterm-addon-unicode11'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { WebglAddon } from 'xterm-addon-webgl'
import * as commas from '../../api/core-renderer'
import type { MenuItem } from '../../typings/menu'
import type { TerminalInfo, TerminalTab, TerminalTabGroup, XtermBufferPosition, XtermLink } from '../../typings/terminal'
import { toKeyEventPattern } from '../utils/accelerator'
import { openContextMenu } from '../utils/frame'
import { getPrompt, getWindowsProcessInfo } from '../utils/terminal'
import { addFirework } from './fireworks'
import { useKeyBindings } from './keybinding'
import { useSettings } from './settings'
import { useTheme } from './theme'

const settings = $(useSettings())
const theme = $(useTheme())

const tabs = $ref<TerminalTab[]>([])
export function useTerminalTabs() {
  return $$(tabs)
}

let activeIndex = $ref(-1)
export function useTerminalActiveIndex() {
  return $$(activeIndex)
}

const currentTerminal = $computed(() => {
  if (activeIndex === -1) return null
  return tabs[activeIndex]
})
export function useCurrentTerminal() {
  return $$(currentTerminal)
}

export function getTerminalTabIndex(tab: TerminalTab) {
  return tabs.indexOf(toRaw(tab))
}

const terminalOptions = $computed<Partial<ITerminalOptions>>(() => {
  return {
    rendererType: settings['terminal.renderer.type'] === 'webgl'
      ? 'canvas' : settings['terminal.renderer.type'],
    fontSize: settings['terminal.style.fontSize'],
    fontFamily: settings['terminal.style.fontFamily'],
    allowTransparency: theme.opacity < 1,
    theme,
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
  cwd?: string,
  shell?: string,
  command?: string,
  group?: TerminalTabGroup,
}

export async function createTerminalTab({
  cwd: workingDirectory,
  shell: shellPath,
  command,
  group,
}: CreateTerminalTabOptions = {}) {
  const info: TerminalInfo = await ipcRenderer.invoke('create-terminal', { cwd: workingDirectory, shell: shellPath })
  const xterm = new Terminal(terminalOptions)
  const tab = reactive<TerminalTab>({
    ...info,
    title: '',
    xterm: markRaw(xterm),
    addons: markRaw({}),
    links: markRaw([]),
    alerting: false,
    group,
  })
  xterm.attachCustomKeyEventHandler(event => {
    // Support shortcuts on Windows
    if (process.platform === 'win32' && event.ctrlKey) {
      if (event.key === 'c' && xterm.hasSelection()) return false
      if (event.key === 'f') return false
    }
    const matchedItem = rendererKeybindings.find(item => isMatch(event, item.pattern))
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
  const updateCwd = debounce(async () => {
    if (settings['terminal.tab.liveCwd']) {
      const latestCwd: string | undefined = await ipcRenderer.invoke('get-terminal-cwd', tab.pid)
      if (latestCwd) {
        tab.cwd = latestCwd
      }
    }
  }, 250)
  xterm.onLineFeed(() => {
    updateCwd()
  })
  xterm.onBell(() => {
    tab.alerting = true
    ipcRenderer.invoke('beep')
  })
  // iTerm2 escape codes
  xterm.parser.registerOscHandler(1337, data => {
    const args = data.split('=')
    switch (args[0]) {
      case 'CursorShape':
        switch (args[1]) {
          case '0':
            xterm.options.cursorStyle = 'block'
            break
          case '1':
            xterm.options.cursorStyle = 'bar'
            break
          case '2':
            xterm.options.cursorStyle = 'underline'
            break
        }
        break
      case 'SetMark':
        // TODO: add jumping logics
        xterm.registerMarker(0)
        break
      case 'StealFocus':
        ipcRenderer.invoke('activate-window')
        activateTerminalTab(tab)
        break
      case 'ClearScrollback':
        xterm.clear()
        break
      case 'CurrentDir':
        tab.cwd = args[1]
        break
      case 'RequestAttention':
        switch (args[1]) {
          case 'yes':
            ipcRenderer.invoke('bounce', {
              active: true,
              type: 'critical',
            })
            break
          case 'no':
            ipcRenderer.invoke('bounce', {
              active: false,
            })
            break
          case 'once':
            ipcRenderer.invoke('bounce', {
              active: true,
              type: 'informational',
            })
            break
          case 'fireworks': {
            ipcRenderer.invoke('activate-window')
            activateTerminalTab(tab)
            nextTick(() => {
              const element = xterm.element!
              const bounds = element.getBoundingClientRect()
              const dimensions = xterm['_core']._renderService.dimensions
              const { cursorX, cursorY } = xterm.buffer.active
              addFirework({
                x: bounds.x + (cursorX + 0.5) * dimensions.actualCellWidth,
                y: bounds.y + (cursorY + 0.5) * dimensions.actualCellHeight,
              })
            })
            break
          }
        }
        break
      case 'Copy':
        if (args[1]?.startsWith(':')) {
          clipboard.writeText(Buffer.from(args[1].slice(1), 'base64').toString())
        }
        break
      case 'UnicodeVersion': {
        const version = parseInt(args[1], 10)
        if (version <= 6) {
          xterm.unicode.activeVersion = '6'
        } else if (version >= 11) {
          xterm.unicode.activeVersion = '11'
        }
        break
      }
    }
    return true
  })
  // iTerm2 style link
  xterm.parser.registerOscHandler(8, data => {
    const args = data.split(';')
    if (args.length !== 2) return false
    const point: XtermBufferPosition = {
      x: xterm.buffer.active.cursorX + 1,
      y: xterm.buffer.active.cursorY + 1,
    }
    if (args[1]) {
      tab.links.push({ start: point, uri: args[1] })
    } else {
      const activeLink = findLast(tab.links, item => !item.end)
      if (activeLink) {
        point.x -= 1
        activeLink.end = point
      }
    }
    return true
  })
  xterm.registerLinkProvider({
    provideLinks(y, callback) {
      const links = tab.links
        .filter((link): link is Required<XtermLink> => {
          return Boolean(link.end && link.start.y <= y && link.end.y >= y)
        })
        .map(link => ({
          range: {
            start: link.start,
            end: link.end,
          },
          text: xterm.buffer.active.getLine(y)!.translateToString(
            false,
            link.start.y < y ? undefined : link.start.x,
            link.end.y > y ? undefined : link.end.x,
          ),
          activate(event) {
            const shouldOpen = settings['terminal.link.modifier'] === 'Alt' ? event.altKey
              : (process.platform === 'darwin' ? event.metaKey : event.ctrlKey)
            if (shouldOpen) {
              shell.openExternal(link.uri)
            }
          },
        }))
      callback(links)
    },
  })
  // iTerm2 style notification
  xterm.parser.registerOscHandler(9, data => {
    ipcRenderer.invoke('notify', {
      title: getTerminalTabTitle(tab),
      body: data,
    })
    return true
  })
  // Commas protocol
  xterm.parser.registerOscHandler(539, data => {
    try {
      const { argv, cwd, stdin } = JSON.parse(data)
      switch (argv[0]) {
        case 'cli':
          ipcRenderer.invoke('cli', { argv: argv.slice(1), cwd, stdin }).then(result => {
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
  watch($$(terminalOptions), options => {
    const latestXterm = tab.xterm
    for (const [key, value] of Object.entries(options)) {
      latestXterm.options[key] = value
    }
    loadTerminalAddons(tab)
  })
  if (command) {
    executeTerminalTab(tab, command)
  }
  tabs.push(tab)
  activeIndex = tabs.length - 1
  return tab
}

const createResizeObserver = memoize(() => {
  return new ResizeObserver(debounce(() => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (currentTerminal?.xterm?.element) {
      currentTerminal.addons.fit.fit()
    }
  }, 250))
})

export function getTerminalTabTitle(tab: TerminalTab) {
  if (tab.pane) {
    return tab.pane.title
  }
  if (tab.group) {
    return tab.group.title
  }
  if (process.platform !== 'win32' && tab.title) {
    return tab.title
  }
  const expr = settings['terminal.tab.titleFormat']
  return getPrompt(expr, tab) || tab.process
}

export function showTabOptions(event?: MouseEvent) {
  const entries = tabs.map((tab, index) => ({ tab, index }))
  const options = entries.map<MenuItem>(({ tab, index }) => {
    const number = index + 1
    return {
      label: getTerminalTabTitle(tab),
      args: [index],
      command: 'select-tab',
      accelerator: number < 10 ? String(number) : undefined,
    }
  })
  openContextMenu(options, event ?? [0, 36], options.findIndex(item => item.args?.[0] === activeIndex))
}

function handleTerminalTabHistory() {
  let navigating: number | null = null
  window.addEventListener('popstate', event => {
    if (!event.state) return
    const targetIndex = tabs.findIndex(item => item.pid === event.state.pid)
    if (targetIndex !== -1) {
      navigating = event.state.pid
      activeIndex = targetIndex
    }
  })
  watch($$(currentTerminal), (value, oldValue) => {
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
    if (currentTerminal) {
      createTerminalTab({
        cwd: currentTerminal.cwd,
        shell: currentTerminal.shell,
      })
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
    xterm.write(data.data)
    // TODO: performance review
    // data.process on Windows will be always equivalent to pty.name
    if (process.platform !== 'win32') {
      tab.process = data.process
    }
  })
  ipcRenderer.on('exit-terminal', (event, data: Pick<TerminalTab, 'pid'>) => {
    const tab = tabs.find(item => item.pid === data.pid)
    if (!tab) return
    const xterm = tab.xterm
    if (xterm.element) {
      const observer: ReturnType<typeof createResizeObserver> | undefined = createResizeObserver.cache.get(undefined)
      if (observer) {
        observer.unobserve(xterm.element)
      }
    }
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
    activeIndex = targetIndex
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
  ipcRenderer.on('go-back', () => {
    history.back()
  })
  ipcRenderer.on('go-forward', () => {
    history.forward()
  })
  ipcRenderer.on('show-tab-options', () => {
    showTabOptions()
  })
}

export function loadTerminalAddons(tab: TerminalTab) {
  const xterm = tab.xterm
  if (!xterm.element) return
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
      let shouldOpen = false
      switch (settings['terminal.link.modifier']) {
        case 'Alt':
          shouldOpen = event.altKey
          break
        case 'CmdOrCtrl':
          shouldOpen = process.platform === 'darwin' ? event.metaKey : event.ctrlKey
          break
        default:
          shouldOpen = event.altKey || (process.platform === 'darwin' ? event.metaKey : event.ctrlKey)
          break
      }
      if (shouldOpen) {
        shell.openExternal(uri)
      }
    }, {}, true)
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
      delete tab.addons.ligatures
    }
  }
  if (settings['terminal.renderer.type'] === 'webgl' && !xterm.options.allowTransparency) {
    if (!tab.addons.webgl) {
      tab.addons.webgl = new WebglAddon()
      xterm.loadAddon(tab.addons.webgl)
    }
  } else {
    if (tab.addons.webgl) {
      tab.addons.webgl.dispose()
      delete tab.addons.webgl
    }
  }
  commas.proxy.app.events.emit('terminal-tab-effect', tab)
}

export function mountTerminalTab(tab: TerminalTab, element: HTMLElement) {
  const xterm = tab.xterm
  xterm.open(element)
  loadTerminalAddons(tab)
  const observer = createResizeObserver()
  observer.observe(element)
  tab.addons.fit.fit()
  xterm.focus()
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
  const index = getTerminalTabIndex(tab)
  tabs.splice(index, 1)
  const length = tabs.length
  if (!length) {
    window.close()
  } else {
    activeIndex = activeIndex > index
      ? activeIndex - 1 : Math.min(index, length - 1)
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
    activeIndex = tabs.push(tab) - 1
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
