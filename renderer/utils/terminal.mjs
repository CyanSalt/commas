import * as os from 'os'
import * as path from 'path'
import icons from '../assets/icons.mjs'

/**
 * @typedef IconEntity
 * @property {string} name
 * @property {string[]} [context]
 * @property {RegExp} [pattern]
 *
 * @typedef Pane
 * @property {IconEntity} icon
 *
 * @typedef {import('xterm').Terminal} Terminal
 *
 * @typedef TerminalTab
 * @property {number} id
 * @property {string} process
 * @property {string} title
 * @property {string} cwd
 * @property {string} shell
 * @property {Terminal} xterm
 * @property {Record<string, any>} addons
 * @property {number} [launcher]
 * @property {Pane} [pane]
 */

const meta = {
  hostname: os.hostname(),
  username: os.userInfo().username,
}

/**
 * @param {string} directory
 */
export function resolveHome(directory) {
  if (!directory) return directory
  return directory.startsWith('~')
    ? process.env.HOME + directory.slice(1) : directory
}

/**
 * @param {string} directory
 */
export function omitHome(directory) {
  if (!directory || process.platform === 'win32') return directory
  // TODO: might cause error
  return directory.startsWith(process.env.HOME)
    ? '~' + directory.slice(process.env.HOME.length) : directory
}

/**
 * @param {string} expr
 * @param {TerminalTab} tab
 */
export function getPrompt(expr, tab) {
  if (!expr) return ''
  return expr
    .replace(/\\h/g, meta.hostname.split('.')[0])
    .replace(/\\H/g, meta.hostname)
    .replace(/\\l/g, tab ? tab.pid : '')
    .replace(/\\u/g, meta.username)
    .replace(/\\v/g, tab ? tab.process : '')
    .replace(/\\w/g, tab ? () => omitHome(tab.cwd) : '')
    .replace(/\\W/g, tab ? () => path.basename(tab.cwd) : '')
}

/**
 * @param {string} process
 * @returns {IconEntity}
 */
export function getIconEntityByProcess(process) {
  let name = process.toLowerCase()
  // strip extname in process name (Windows only)
  const point = name.lastIndexOf('.')
  if (point !== -1) name = name.slice(0, point)
  return icons.find(icon => {
    if (icon.pattern) return icon.pattern.test(name)
    return icon.context.includes(name)
  })
}

/**
 * Supports WSL Style `/mnt/c/Users` and MinGW Style `/c/Users`
 * @param {string} directory
 */
export function resolveWindowsDisk(directory) {
  if (!directory) return directory
  const slices = directory.split('/')
  if (slices[0] === '') {
    let start = 1
    if (slices[start] === 'mnt') start += 1
    const disk = slices[start].toUpperCase() + ':'
    return [disk].concat(slices.slice(start + 1)).join(path.sep)
  }
  return directory
}

const windowsCMDShells = ['cmd.exe']
// `git-cmd.exe --no-cd` has no title feature like windows built-in cmd.exe
// but invoke MinGW core when arguments `--command=usr/bin/bash.exe` specified
// TODO: judge title feature with both command and arguments
const windowsStandardShells = ['bash.exe', 'git-cmd.exe']

/**
 * @param {string} shell
 * @param {string} title
 * @returns {Partial<TerminalTab>}
 */
export function getWindowsProcessInfo(shell, title) {
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
