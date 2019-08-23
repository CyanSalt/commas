import {exec as execCallback} from 'child_process'
import {promises as fs} from 'fs'
import {promisify} from 'util'
import {hostname, userInfo} from 'os'
import {basename} from 'path'
import {remote} from 'electron'
import {createIDGenerator} from '@/utils/identity'
import {translate} from '@/utils/i18n'
import icons from '@assets/icon.json'

const exec = promisify(execCallback)
const generateID = createIDGenerator(id => id - 1)

export const InternalTerminals = {
  settings: {
    internal: true,
    id: generateID(),
    process: remote.app.getName(),
    title: translate('Settings#!7'),
    cwd: '',
  },
}

export const quote = command => `"${command.replace(/"/g, '"\\""')}"`

export function resolveHome(directory) {
  if (!directory) return directory
  return directory.startsWith('~') ?
    process.env.HOME + directory.slice(1) : directory
}

export function omitHome(directory) {
  if (!directory || process.platform === 'win32') return directory
  return directory.startsWith(process.env.HOME) ?
    '~' + directory.slice(process.env.HOME.length) : directory
}

export async function getCwd(pid) {
  try {
    if (process.platform === 'darwin') {
      const {stdout} = await exec(`lsof -p ${pid} | grep cwd`)
      return stdout.substring(stdout.indexOf('/'), stdout.length - 1)
    } else if (process.platform === 'linux') {
      return await fs.readlink(`/proc/${pid}/cwd`)
    }
  } catch (err) {
    return ''
  }
}

// for Windows cmd.exe only
export function getProcessName(title) {
  let program = basename(title)
  const separator = ' - '
  const index = program.indexOf(separator)
  if (index === -1) return program
  return program.slice(index + separator.length)
}

const host = hostname()
const shorthost = host.split('.')[0]
const user = userInfo().username

export function getPrompt(expr, tab) {
  return expr
    .replace(/\\h/g, shorthost)
    .replace(/\\H/g, host)
    .replace(/\\l/g, tab ? tab.id : '')
    .replace(/\\u/g, user)
    .replace(/\\v/g, tab ? tab.process : '')
    .replace(/\\w/g, tab ? () => omitHome(tab.cwd) : '')
    .replace(/\\W/g, tab ? () => basename(tab.cwd) : '')
}

const iconset = icons.map(icon => {
  if (icon.pattern) {
    try {
      icon.pattern = new RegExp(icon.pattern)
    } catch (err) {
      icon.pattern = null
    }
  }
  return icon
})

export function getIcon(process) {
  const name = process.toLowerCase()
  return iconset.find(icon => {
    if (icon.pattern) return new RegExp(icon.pattern).test(name)
    return icon.context.includes(name)
  })
}
