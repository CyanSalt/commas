const { build } = require('esbuild')
const externalNodeModules = require('./plugins/esbuild/external-node-modules')
const importGlob = require('./plugins/esbuild/import-glob')

module.exports = (versions) => build({
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
