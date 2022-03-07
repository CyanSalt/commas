import buildMain from './build-main.mjs'

/**
 * @param {NodeJS.ProcessVersions} versions
 */
export default (versions) => buildMain(versions, options => {
  options.entryPoints = ['main/index.ts']
  options.outfile = 'main/dist/index.js'
  return options
})
