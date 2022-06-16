import * as path from 'path'
import buildAddonMain from './atomics/build-addon-main.mjs'
import buildAddonRenderer from './atomics/build-addon-renderer.mjs'
import buildCoreMain from './atomics/build-core-main.mjs'
import buildCoreRenderer from './atomics/build-core-renderer.mjs'
import { execa } from './utils/child-process.mjs'
import getAddons from './utils/get-addons.mjs'
import getVersions from './utils/get-versions.mjs'

async function getModifiedFiles() {
  const { stdout: files } = await execa(`git ls-files --modified`)
  return files.trim().split('\n')
}

async function checkFiles(files, directory, factory) {
  const dir = directory.endsWith(path.sep) ? directory : directory + path.sep
  return files.some(file => file.startsWith(dir)) ? factory() : undefined
}

Promise.all([
  getModifiedFiles(),
  getVersions(),
]).then(([files, versions]) => Promise.all([
  checkFiles(files, 'src/main', () => buildCoreMain(versions)),
  checkFiles(files, 'src/renderer', () => buildCoreRenderer(versions)),
  getAddons('addons').then(dirs => Promise.all(dirs.flatMap(dir => [
    checkFiles(files, `${dir}/src/main`, () => buildAddonMain(versions, dir)),
    checkFiles(files, `${dir}/src/renderer`, () => buildAddonRenderer(versions, dir)),
  ]))),
]))
