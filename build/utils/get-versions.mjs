import childProcess from 'child_process'
import path from 'path'
import { getDirectory, resolveCommonJS } from './common.mjs'

export default async function () {
  let electron
  if (import.meta.resolve) {
    electron = await import.meta.resolve('electron/cli.js')
  } else {
    electron = resolveCommonJS(import.meta, 'electron/cli.js')
  }
  const versionScript = path.resolve(getDirectory(import.meta), 'electron-versions.cjs')
  return JSON.parse(
    childProcess.execSync(`node ${electron} ${versionScript}`).toString(),
  )
}
