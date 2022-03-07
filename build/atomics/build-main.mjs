import esbuild from 'esbuild'
import externalNodeModules from '../utils/esbuild-external-node-modules.mjs'

/**
 * @template T
 * @type {(value: T) => T} Pipe<T>
 */

/**
 * @param {NodeJS.ProcessVersions} versions
 * @param {Pipe<import('esbuild').BuildOptions>} tap
 */
export default (versions, tap) => esbuild.build(tap({
  bundle: true,
  platform: 'node',
  plugins: [
    externalNodeModules(),
  ],
  target: `node${versions.node}`,
  define: {
    // Optimization
    'process.type': JSON.stringify('browser'),
  },
}))
