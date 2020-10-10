const childProcess = require('child_process')
const util = require('util')

/**
 * @typedef {import('events')} EventEmitter
 */

const execa = util.promisify(childProcess.exec)

/**
 * @param {EventEmitter} emitter
 * @param {string} finish
 * @param {string} [error]
 * @returns {Promise<any[]>}
 */
function emitting(emitter, finish, error) {
  return new Promise((resolve, reject) => {
    emitter.on(finish, (...args) => resolve(args))
    if (error) {
      emitter.on(error, (...args) => reject(args))
    }
  })
}

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
  /* eslint-disable-next-line unicorn/no-unsafe-regex */
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
  emitting,
  createIDGenerator,
  createPattern,
}
