import * as path from 'node:path'
import buildAddonMain from './atomics/build-addon-main.mjs'
import buildAddonRenderer from './atomics/build-addon-renderer.mjs'
import buildCoreMain from './atomics/build-core-main.mjs'
import buildCoreRenderer from './atomics/build-core-renderer.mjs'
import { execa } from './utils/child-process.mjs'
import getAddons from './utils/get-addons.mjs'
import getVersions from './utils/get-versions.mjs'

async function getModifiedFiles() {
  const { stdout: files } = await execa(`git ls-files --modified --others --exclude-standard`)
  return files.trim().split('\n')
}

/**
 * @param {string[]} files
 * @param {string | string[]} directory
 * @returns {boolean}
 */
function hasModified(files, directory) {
  if (Array.isArray(directory)) {
    return directory.some(item => hasModified(files, item))
  }
  const dir = directory.endsWith(path.posix.sep) ? directory : directory + path.posix.sep
  return files.some(file => file.startsWith(dir))
}

/**
 * @template T
 * @param {boolean} condition
 * @param {() => T} factory
 * @returns
 */
function only(condition, factory) {
  return condition ? factory() : undefined
}

Promise.all([
  getModifiedFiles(),
  getVersions(),
]).then(([files, versions]) => Promise.all([
  only(hasModified(files, ['api/modules', 'src/main', 'src/shared']), () => buildCoreMain(versions)),
  only(hasModified(files, ['api/modules', 'src/renderer', 'src/shared']), () => buildCoreRenderer(versions)),
  getAddons('addons').then(dirs => Promise.all(dirs.flatMap(dir => [
    only(hasModified(files, `${dir}/src/main`), () => buildAddonMain(versions, dir)),
    only(hasModified(files, `${dir}/src/renderer`), () => buildAddonRenderer(versions, dir)),
  ]))),
]))
