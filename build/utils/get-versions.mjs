import path from 'node:path'
import electronPath from 'electron'
import { execa } from './child-process.mjs'
import { getDirectory } from './common.mjs'

export default async function () {
  const versionScript = path.resolve(getDirectory(import.meta), 'electron-versions.cjs')
  const { stdout: versions } = await execa(`${electronPath} ${versionScript}`, {
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: '1',
    },
  })
  return JSON.parse(versions)
}
