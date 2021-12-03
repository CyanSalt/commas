import esbuild from 'esbuild'
import externalNodeModules from './plugins/esbuild/external-node-modules.mjs'
import importGlob from './plugins/esbuild/import-glob.mjs'

export default (versions) => esbuild.build({
  entryPoints: ['main/index.ts'],
  outfile: 'main/dist/index.js',
  bundle: true,
  platform: 'node',
  plugins: [
    externalNodeModules(),
    importGlob(),
  ],
  target: `node${versions.node}`,
  define: {
    // Optimization
    'process.type': JSON.stringify('browser'),
  },
})
