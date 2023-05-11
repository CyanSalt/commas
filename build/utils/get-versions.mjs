import path from 'node:path'
import { execa } from './child-process.mjs'
import { getDirectory, resolveCommonJS } from './common.mjs'

export default async function () {
  let electron
  if (import.meta.resolve) {
    electron = await import.meta.resolve('electron/cli.js')
  } else {
    electron = resolveCommonJS(import.meta, 'electron/cli.js')
  }
  const versionScript = path.resolve(getDirectory(import.meta), 'electron-versions.cjs')
  const { stdout: versions } = await execa(`node ${electron} ${versionScript}`)
  return JSON.parse(versions)
}
