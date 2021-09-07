import * as os from 'os'
import * as path from 'path'
import { ipcRenderer } from 'electron'
import type { TerminalTab } from '../../typings/terminal'
import icons from '../assets/icons'

const meta = {
  homedir: os.homedir(),
  hostname: os.hostname(),
  username: os.userInfo().username,
}

export function resolveHome(directory: string) {
  return directory.startsWith('~')
    ? meta.homedir + directory.slice(1) : directory
}

export function omitHome(directory: string) {
  if (!directory || process.platform === 'win32') return directory
  return directory.startsWith(meta.homedir)
    ? '~' + directory.slice(meta.homedir.length) : directory
}

export function getPrompt(expr: string, tab: TerminalTab | null) {
  if (!expr) return ''
  const result = expr
    .replace(/\\h/g, meta.hostname.split('.')[0])
    .replace(/\\H/g, meta.hostname)
    .replace(/\\u/g, meta.username)
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
  // strip extname in process name (Windows only)
  const point = name.lastIndexOf('.')
  if (point !== -1) {
    name = name.slice(0, point)
  }
  return icons.find(icon => {
    if (icon.pattern) return icon.pattern.test(name)
    return icon.context!.includes(name)
  })
}

/**
 * Supports WSL Style `/mnt/c/Users` and MinGW Style `/c/Users`
 */
export function resolveWindowsDisk(directory: string) {
  if (!directory) return directory
  const slices = directory.split('/')
  if (slices[0] === '') {
    let start = 1
    if (slices[start] === 'mnt') {
      start += 1
    }
    const disk = slices[start].toUpperCase() + ':'
    return [disk].concat(slices.slice(start + 1)).join(path.sep)
  }
  return directory
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
