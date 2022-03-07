import module from 'module'
import * as path from 'path'
import * as url from 'url'

export function getFile(meta) {
  return url.fileURLToPath(meta.url)
}

export function getDirectory(meta) {
  return path.dirname(getFile(meta))
}

export function createRequire(meta) {
  return module.createRequire(getFile(meta))
}

export function requireCommonJS(meta, id) {
  return createRequire(meta)(id)
}

export function resolveCommonJS(meta, id) {
  return createRequire(meta).resolve(id)
}
