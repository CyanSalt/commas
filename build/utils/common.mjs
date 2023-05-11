import module from 'node:module'
import * as path from 'node:path'
import * as url from 'node:url'

/**
 * @param {ImportMeta} meta
 */
export function getFile(meta) {
  return url.fileURLToPath(meta.url)
}

/**
 * @param {ImportMeta} meta
 */
export function getDirectory(meta) {
  return path.dirname(getFile(meta))
}

/**
 * @param {ImportMeta} meta
 */
export function createRequire(meta) {
  return module.createRequire(getFile(meta))
}

/**
 * @param {ImportMeta} meta
 * @param {string} id
 */
export function requireCommonJS(meta, id) {
  return createRequire(meta)(id)
}

/**
 * @param {ImportMeta} meta
 * @param {string} id
 */
export function resolveCommonJS(meta, id) {
  return createRequire(meta).resolve(id)
}
