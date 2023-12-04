import path from 'node:path'
import url from 'node:url'
import { execa } from './child-process.mjs'
import { getDirectory, resolveCommonJS } from './common.mjs'

export default async function () {
  let electron = resolveCommonJS(import.meta, 'electron/cli.js')
  if (import.meta.resolve) {
    const resolved = await import.meta.resolve('electron/cli.js')
    electron = url.fileURLToPath(resolved)
  } else {
    electron = resolveCommonJS(import.meta, 'electron/cli.js')
  }
  const versionScript = path.resolve(getDirectory(import.meta), 'electron-versions.cjs')
  const { stdout: versions } = await execa(`node ${electron} ${versionScript}`)
  return JSON.parse(versions)
}
