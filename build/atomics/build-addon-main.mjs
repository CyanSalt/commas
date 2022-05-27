import * as fs from 'fs'
import * as path from 'path'
import alias from '../utils/esbuild-alias.mjs'
import buildMain from './build-main.mjs'

/**
 * @param {NodeJS.ProcessVersions} versions
 * @param {string} dir
 * @param {boolean} [external]
 */
export default async (versions, dir, external) => {
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
    if (external) {
      options.plugins.unshift(alias({
        '@vue/reactivity': 'commas:external/@vue/reactivity',
        vue: 'commas:external/vue',
      }))
    }
    return options
  })
}
