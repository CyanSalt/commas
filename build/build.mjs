import childProcess from 'child_process'
import module from 'module'
import path from 'path'
import url from 'url'
import buildMain from './build-main.mjs'
import buildRenderer from './build-renderer.mjs'

const filename = url.fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function getVersions() {
  let electron
  if (import.meta.resolve) {
    electron = await import.meta.resolve('electron/cli.js')
  } else {
    const require = module.createRequire(filename)
    electron = require.resolve('electron/cli.js')
  }
  const versionScript = path.resolve(dirname, 'electron-versions.js')
  return JSON.parse(
    childProcess.execSync(`node ${electron} ${versionScript}`).toString(),
  )
}

getVersions().then(versions => {
  buildMain(versions)
  buildRenderer(versions)
})
