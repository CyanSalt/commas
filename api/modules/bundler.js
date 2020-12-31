/**
 * @type {NodeRequireCache}
 */
let cache = Object.create(null)

/**
 * @type {Record<string, string>}
 */
let aliases = Object.create(null)

/**
 * @param {NodeRequireCache} data
 */
function setCache(data) {
  cache = data
}
/**
 * @param {Record<string, string>} data
 */
function setAliases(data) {
  aliases = data
}

/**
 * @param {string} request
 */
function noConflictRequire(request) {
  const path = aliases[request] || `./renderer/${request}`
  const cachedModule = cache[path]
  if (!cachedModule) {
    throw new Error(`Cannot find module '${request}'.`)
  }
  return cachedModule.exports
}

module.exports = {
  setCache,
  setAliases,
  require: noConflictRequire,
}
