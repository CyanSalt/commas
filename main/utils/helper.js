const childProcess = require('child_process')
const util = require('util')

const execa = util.promisify(childProcess.exec)

/**
 * @param {(id: number) => number} [iterator]
 */
function createIDGenerator(iterator) {
  if (!iterator) iterator = id => id + 1
  let id = 0
  return () => {
    id = iterator(id)
    return id
  }
}

/**
 * @param {string} expression
 */
function createPattern(expression) {
  const matches = expression.match(/^s\/(.+)\/([a-z]+)?$/)
  if (!matches) return null
  try {
    return new RegExp(matches[1], matches[2])
  } catch {
    return null
  }
}

module.exports = {
  execa,
  createIDGenerator,
  createPattern,
}
