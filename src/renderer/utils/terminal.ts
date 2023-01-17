import * as os from 'os'
import * as path from 'path'
import { ipcRenderer } from 'electron'
import { omitHome, resolveWindowsDisk } from '../../shared/terminal'
import type { TerminalTab } from '../../typings/terminal'
import icons from '../assets/icons'

export function getPrompt(expr: string, tab: TerminalTab | null) {
  if (!expr) return ''
  const result = expr
    .replace(/\\h/g, () => os.hostname().split('.')[0])
    .replace(/\\H/g, () => os.hostname())
    .replace(/\\u/g, () => os.userInfo().username)
  if (tab) {
    return result
      .replace(/\\l/g, tab.pid ? String(tab.pid) : '')
      .replace(/\\v/g, tab.process)
      .replace(/\\w/g, () => omitHome(tab.cwd))
      .replace(/\\W/g, () => path.basename(tab.cwd))
  } else {
    return result
      .replace(/\\l/g, '')
      .replace(/\\v/g, '')
      .replace(/\\w/g, '')
      .replace(/\\W/g, '')
  }
}

export function getIconEntryByProcess(process: string) {
  let name = process.toLowerCase()
  const ext = path.extname(name)
  // strip '.exe' extname in process name (Windows only)
  if (ext === '.exe') {
    name = name.slice(0, ext.length)
  } else if (ext) {
    name = ext
  }
  return icons.find(icon => icon.patterns.some(item => {
    return typeof item === 'string'
      ? item === name
      : item.test(name)
  }))
}

export function getShells() {
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
    return `${tab.pane.type ?? 'pane'}@${tab.shell || tab.process}`
  } else {
    return `process@${tab.pid}`
  }
}
