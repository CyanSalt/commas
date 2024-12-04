import * as fs from 'node:fs'
import * as path from 'node:path'
import buildRenderer from './build-renderer.mjs'

/**
 * @param {NodeJS.ProcessVersions} versions
 * @param {string} dir
 * @param {boolean} [external]
 */
export default async (versions, dir, external) => {
  try {
    await fs.promises.access(path.join(dir, 'src/renderer/index.ts'))
  } catch {
    return
  }
  return buildRenderer(versions, options => {
    options.root = dir
    options.build = options.build ?? {}
    options.build.outDir = 'dist/renderer'
    options.build.lib = {
      entry: 'src/renderer/index.ts',
      formats: ['cjs'],
      fileName: () => 'index.js',
      cssFileName: 'style',
    }
    if (external) {
      const alias = {
        '@vue/reactivity': 'commas:external/@vue/reactivity',
        vue: 'commas:external/vue',
      }
      options.resolve = { alias }
      /** @type {(string | RegExp)[]} */
      const moduleIds = Object.keys(alias)
      const rollupOptions = options.build.rollupOptions
      if (rollupOptions?.external && Array.isArray(rollupOptions.external)) {
        rollupOptions.external = rollupOptions.external.filter(item => !moduleIds.includes(item))
      }
    }
    return options
  })
}
