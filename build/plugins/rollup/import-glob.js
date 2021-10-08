const path = require('path')
const fastglob = require('fast-glob')

const importGlob = () => ({
  name: 'import-glob',
  enforce: 'pre',
  resolveId(source, importer) {
    if (!source.includes('*')) return null
    return {
      id: source,
      meta: { 'import-glob': { importer } },
    }
  },
  async load(id) {
    if (!id.includes('*')) return null
    const meta = this.getModuleInfo(id).meta['import-glob']
    if (!meta) return null
    const cwd = path.dirname(meta.importer)
    const files = await fastglob(id, { cwd })
    return `
      ${files.map((module, index) => `import * as module$${index} from '${path.posix.join(cwd, module)}'`).join(';')}
      export default {${files.map((module, index) => `"${module}": module$${index}`).join(',')}}
    `
  },
})

module.exports = importGlob
