import {exec} from 'child_process'
import {readlink} from 'fs'
import {promisify} from 'util'
import {hostname, userInfo} from 'os'
import {basename} from 'path'
import {remote} from 'electron'
import {createIDGenerator} from '@/utils/identity'
import {translate} from '@/utils/i18n'
import {hasAlphaChannel, rgba} from '@/utils/color'

const promises = {
  exec: promisify(exec),
  readlink: promisify(readlink),
}

const generateID = createIDGenerator()

export const InternalTerminals = {
  settings: {
    internal: true,
    id: -generateID(),
    process: remote.app.getName(),
    title: translate('Settings#!7'),
    cwd: '',
  },
}

export const quote = command => `"${command.replace(/"/g, '"\\""')}"`

export const resolveHome = directory => {
  if (!directory) return directory
  return directory.startsWith('~') ?
    process.env.HOME + directory.slice(1) : directory
}

export const omitHome = directory => {
  if (!directory) return directory
  return directory.startsWith(process.env.HOME) ?
    '~' + directory.slice(process.env.HOME.length) : directory
}

export const getCwd = async pid => {
  try {
    if (process.platform === 'darwin') {
      const {stdout} = await promises.exec(`lsof -p ${pid} | grep cwd`)
      return stdout.substring(stdout.indexOf('/'), stdout.length - 1)
    } else if (process.platform === 'linux') {
      return await readlink(`/proc/${pid}/cwd`)
    }
  } catch (err) {
    return ''
  }
}

const host = hostname()
const shorthost = host.split('.')[0]
const user = userInfo().username

export const getPrompt = (expr, tab) => {
  return expr
    .replace(/\\h/g, shorthost)
    .replace(/\\H/g, host)
    .replace(/\\l/g, tab ? tab.id : '')
    .replace(/\\u/g, user)
    .replace(/\\v/g, tab ? tab.process : '')
    .replace(/\\w/g, tab ? () => omitHome(tab.cwd) : '')
    .replace(/\\W/g, tab ? () => basename(tab.cwd) : '')
}

export const normalizeTheme = original => {
  // TODO: support transparency background color
  const theme = {...original}
  if (!hasAlphaChannel(theme.selection)) {
    const alpha = theme.type === 'light' ? 0.15 : 0.3
    theme.selection = rgba(theme.foreground, alpha)
  }
  return theme
}
