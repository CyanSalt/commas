import * as os from 'node:os'
import * as path from 'node:path'
import { parse } from 'shell-quote'
import { ipcRenderer } from '@commas/electron-ipc'
import type { MenuItem } from '@commas/types/menu'
import type { TerminalTab } from '@commas/types/terminal'
import * as commas from '../../api/core-renderer'
import { omitHome, resolveWindowsDisk } from '../../shared/terminal'
import icons from '../assets/icons'

export const TERMINAL_DIRECTORY_SHELL = '/'

export function isShellProcess(tab: TerminalTab) {
  return tab.process === (
    path.isAbsolute(tab.process) ? tab.shell : path.basename(tab.shell)
  )
}

export function getProcessName(tab: TerminalTab) {
  if (isShellProcess(tab)) {
    if (tab.command) {
      const entries = parse(tab.command)
      const command = entries.find((item): item is string => typeof item === 'string')
      if (command) return path.basename(command)
    }
  }
  return path.basename(tab.process) + (tab.process.endsWith(path.sep) ? path.sep : '')
}

export function getPrompt(expr: string, tab: TerminalTab | null) {
  if (!expr) return ''
  const result = expr
    .replace(/\\h/g, () => os.hostname().split('.')[0])
    .replace(/\\H/g, () => os.hostname())
    .replace(/\\u/g, () => os.userInfo().username)
  if (tab) {
    return result
      .replace(/\\l/g, tab.pid ? String(tab.pid) : '')
      .replace(/\\s/g, () => getProcessName(tab))
      .replace(/\\w/g, () => omitHome(tab.cwd))
      .replace(/\\W/g, () => path.basename(tab.cwd))
  } else {
    return result
      .replace(/\\l/g, '')
      .replace(/\\s/g, '')
      .replace(/\\w/g, '')
      .replace(/\\W/g, '')
  }
}

export function getIconEntry(tab: TerminalTab) {
  let name = getProcessName(tab).toLowerCase()
  let ext = path.extname(name)
  // strip '.exe' extname in process name (Windows only)
  if (ext === '.exe') {
    name = name.slice(0, ext.length)
  } else {
    let extension = ext
    let basename = path.basename(name, extension)
    while (extension) {
      extension = path.extname(basename)
      basename = path.basename(basename, extension)
      ext = extension + ext
    }
    name = ext
  }
  const allIcons = [
    ...commas.proxy.context.getCollection('terminal.icon'),
    ...icons,
  ]
  return allIcons.find(icon => icon.patterns.some(item => {
    return typeof item === 'string'
      ? item === name
      : item.test(name)
  }))
}

export function getShells(): Promise<string[]> {
  return ipcRenderer.invoke('get-shells')
}

const windowsCMDShells = ['cmd.exe']
// `git-cmd.exe --no-cd` has no title feature like windows built-in cmd.exe
// but invoke MinGW core when arguments `--command=usr/bin/bash.exe` specified
// TODO: judge title feature with both command and arguments
const windowsStandardShells = ['bash.exe', 'wsl.exe', 'git-cmd.exe']

export function getWindowsProcessInfo(shell: string, title: string): Partial<TerminalTab> | null {
  shell = path.basename(shell)
  if (windowsCMDShells.includes(shell)) {
    let program = path.basename(title)
    const separator = ' - '
    const index = program.indexOf(separator)
    if (index !== -1) {
      program = program.slice(index + separator.length)
    }
    return { process: program }
  } else if (windowsStandardShells.includes(shell)) {
    const separator = title.startsWith('MINGW') ? ':' : ': '
    const index = title.indexOf(separator)
    if (index !== -1) {
      const cwd = title.slice(index + separator.length)
      return { cwd: resolveWindowsDisk(cwd) }
    }
  }
  return null
}

export function getTerminalTabID(tab: TerminalTab) {
  if (tab.pane) {
    return `${tab.pane.name ?? 'pane'}@${tab.pid || tab.shell}`
  } else {
    return `process@${tab.pid}`
  }
}

export function getReadableSignal(code: number) {
  if (code > 128 && code < 256) {
    return Object.entries(os.constants.signals)
      .find(([name, value]) => 128 + value === code)
      ?.[0]
  }
}
export function createTerminalTabContextMenu(tab?: TerminalTab) {
  let updatingItems: MenuItem[] = [
    {
      label: 'Duplicate Tab#!menu.duplicatetab',
      accelerator: 'CmdOrCtrl+D',
      command: 'duplicate-tab',
      args: tab ? [{ pid: tab.pid }] : undefined,
    },
    {
      label: 'Split Tab#!menu.splittab',
      accelerator: 'CmdOrCtrl+Shift+D',
      command: 'split-tab',
      args: tab ? [{ pid: tab.pid }] : undefined,
    },
  ]
  const deletingItems: MenuItem[] = [
    {
      label: 'Close Tab#!menu.closetab',
      accelerator: 'CmdOrCtrl+W',
      command: 'close-tab',
      args: tab ? [{ pid: tab.pid }] : undefined,
    },
  ]
  return {
    updatingItems,
    deletingItems,
  }
}
