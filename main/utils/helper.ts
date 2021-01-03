import * as childProcess from 'child_process'
import type EventEmitter from 'events'
import * as util from 'util'

const execa = util.promisify(childProcess.exec)

function emitting(emitter: EventEmitter, finish: string, error?: string) {
  return new Promise<any[]>((resolve, reject) => {
    emitter.on(finish, (...args) => {
      resolve(args)
    })
    if (error) {
      emitter.on(error, (...args) => {
        reject(args)
      })
    }
  })
}


type IDIterator = (id: number) => number

function createIDGenerator(iterator?: IDIterator) {
  if (!iterator) iterator = id => id + 1
  let id = 0
  return () => {
    id = iterator!(id)
    return id
  }
}

function createPattern(expression: string) {
  // eslint-disable-next-line unicorn/no-unsafe-regex
  const matches = expression.match(/^s\/(.+)\/([a-z]+)?$/)
  if (!matches) return null
  try {
    return new RegExp(matches[1], matches[2])
  } catch {
    return null
  }
}

export {
  execa,
  emitting,
  createIDGenerator,
  createPattern,
}
