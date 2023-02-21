import { builtinModules } from 'module'
import vue from '@vitejs/plugin-vue'
import reactivityTransform from '@vue-macros/reactivity-transform/vite'
import * as vite from 'vite'
import { requireCommonJS } from '../utils/common.mjs'

const pkg = requireCommonJS(import.meta, '../../package.json')

/**
 * @typedef {import('vite').InlineConfig} InlineConfig
 */

/**
 * @param {NodeJS.ProcessVersions} versions
 * @param {(value: InlineConfig) => InlineConfig} tap
 */
export default (versions, tap) => vite.build(tap({
  configFile: false,
  envFile: false,
  base: './',
  define: {
    // Optimization
    'process.type': JSON.stringify('renderer'),
  },
  plugins: [
    vue(),
    reactivityTransform(),
  ],
  json: {
    stringify: true,
  },
  build: {
    target: `chrome${versions.chrome.split('.')[0]}`,
    assetsDir: '.',
    minify: false,
    rollupOptions: {
      external: [
        /^commas:/,
        'electron',
        ...builtinModules,
        ...Object.keys(pkg.dependencies),
      ],
      output: {
        format: 'cjs',
        exports: 'named',
        freeze: false,
      },
    },
    commonjsOptions: {
      ignore: id => {
        return /^commas:/.test(id) || [
          'electron',
          ...builtinModules,
        ].includes(id)
      },
    },
  },
}))
