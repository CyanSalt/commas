import { builtinModules } from 'module'
import vue from '@vitejs/plugin-vue'
import vite from 'vite'

/**
 * @template T
 * @type {(value: T) => T} Pipe<T>
 */

/**
 * @param {NodeJS.ProcessVersions} versions
 * @param {Pipe<import('vite').InlineConfig>} tap
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
    vue({
      reactivityTransform: true,
    }),
  ],
  json: {
    stringify: true,
  },
  build: {
    target: `chrome${versions.chrome.split('.')[0]}`,
    assetsDir: '.',
    cssCodeSplit: false,
    minify: false,
    rollupOptions: {
      external: [
        /^commas:/,
        'electron',
        ...builtinModules,
        // Connect reactivity system
        '@vue/reactivity',
        'vue',
      ],
      output: {
        format: 'cjs',
        freeze: false,
      },
    },
    commonjsOptions: {
      ignore: [
        id => /^commas:/.test(id),
        'electron',
        ...builtinModules,
      ],
    },
  },
}))
