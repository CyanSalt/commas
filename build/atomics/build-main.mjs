import reactivityTransform from '@vue-macros/reactivity-transform/esbuild'
import esbuild from 'esbuild'
import alias from '../utils/esbuild-alias.mjs'
import bypass from '../utils/esbuild-bypass.mjs'
import externalNodeModules from '../utils/esbuild-external-node-modules.mjs'

/**
 * @typedef {import('esbuild').BuildOptions} BuildOptions
 */

/**
 * @param {NodeJS.ProcessVersions} versions
 * @param {(value: BuildOptions) => BuildOptions} tap
 */
export default (versions, tap) => esbuild.build(tap({
  bundle: true,
  platform: 'node',
  plugins: [
    alias({
      '@commas/native': '../../native',
    }),
    bypass(/^@commas\//),
    externalNodeModules(),
    reactivityTransform(),
  ],
  target: `node${versions.node}`,
  define: {
    // Optimization
    'process.type': JSON.stringify('browser'),
  },
}))
