import * as fs from 'fs'
import * as path from 'path'
import buildMain from './build-main.mjs'

/**
 * @param {NodeJS.ProcessVersions} versions
 * @param {string} dir
 */
export default async (versions, dir) => {
  try {
    await fs.promises.access(path.join(dir, 'src/main/index.ts'))
  } catch {
    return
  }
  return buildMain(versions, options => {
    options.entryPoints = [
      path.join(dir, 'src/main/index.ts'),
    ]
    options.outfile = path.join(dir, 'dist/main/index.js')
    return options
  })
}
