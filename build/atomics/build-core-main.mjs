import buildMain from './build-main.mjs'

/**
 * @param {NodeJS.ProcessVersions} versions
 */
export default (versions) => buildMain(versions, options => {
  options.entryPoints = ['src/main/index.ts']
  options.outfile = 'dist/main/index.js'
  return options
})
