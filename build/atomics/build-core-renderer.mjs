import buildRenderer from './build-renderer.mjs'

function isInitial(id, { getModuleInfo }) {
  const mod = getModuleInfo(id)
  if (!mod) return false
  if (mod.isEntry) return true
  return mod.importers.some(importer => isInitial(importer, { getModuleInfo }))
}

/**
 * @param {NodeJS.ProcessVersions} versions
 */
export default (versions) => buildRenderer(versions, options => {
  options.root = 'src/renderer'
  options.build.outDir = '../../dist/renderer'
  options.build.emptyOutDir = true
  options.define.__VUE_OPTIONS_API__ = JSON.stringify(false)
  options.build.rollupOptions.output.manualChunks = (id, { getModuleInfo }) => {
    if (id.includes('monaco-editor') && isInitial(id, { getModuleInfo })) {
      return 'monaco-editor'
    }
  }
  return options
})
