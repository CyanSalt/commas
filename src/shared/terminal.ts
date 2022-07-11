import * as os from 'os'
import * as path from 'path'

export function resolveHome(directory: string) {
  return directory.startsWith('~')
    ? os.homedir() + directory.slice(1) : directory
}

export function omitHome(directory: string) {
  if (!directory || process.platform === 'win32') return directory
  return directory.startsWith(os.homedir())
    ? '~' + directory.slice(os.homedir().length) : directory
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
