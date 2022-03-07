import * as fs from 'fs'
import * as path from 'path'
import buildRenderer from './build-renderer.mjs'

/**
 * @param {NodeJS.ProcessVersions} versions
 * @param {string} dir
 */
export default async (versions, dir) => {
  try {
    await fs.promises.access(path.join(dir, 'src/renderer/index.ts'))
  } catch {
    return
  }
  return buildRenderer(versions, options => {
    options.root = dir
    options.build.outDir = 'dist/renderer'
    options.build.lib = {
      entry: 'src/renderer/index.ts',
      formats: ['cjs'],
      fileName: () => 'index.js',
    }
    return options
  })
}
