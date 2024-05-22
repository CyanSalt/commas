import path from 'node:path'
import url from 'node:url'
import { execa } from './child-process.mjs'
import { getDirectory } from './common.mjs'

export default async function () {
  const resolved = import.meta.resolve('electron/cli.js')
  const electron = url.fileURLToPath(resolved)
  const versionScript = path.resolve(getDirectory(import.meta), 'electron-versions.cjs')
  const { stdout: versions } = await execa(`node ${electron} ${versionScript}`)
  return JSON.parse(versions)
}
