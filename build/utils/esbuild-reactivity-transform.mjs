import * as fs from 'fs'
import { shouldTransform, transform } from '@vue/reactivity-transform'

/**
 * @returns {import('esbuild').Plugin}
 */
export default () => ({
  name: 'esbuild-reactivity-transform',
  setup(pluginBuild) {
    const filter = /\.(js|ts)$/
    pluginBuild.onLoad({ filter }, async args => {
      const filename = args.path
      const source = await fs.promises.readFile(filename, 'utf8')
      if (shouldTransform(source)) {
        const { code } = transform(source, {
          filename,
          importHelpersFrom: '@vue/reactivity',
        })
        return {
          contents: code,
          loader: /\.ts$/.test(filename) ? 'ts' : 'js',
        }
      }
    })
  },
})
