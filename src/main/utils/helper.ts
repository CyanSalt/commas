import * as childProcess from 'child_process'
import type { EventEmitter } from 'events'
import * as util from 'util'

const execa = util.promisify(childProcess.exec)

interface OnceEmitter<T extends string, U extends any[]> {
  once(name: T, listener: (...args: U) => unknown): this,
}

function until<T extends EventEmitter, U extends string>(emitter: T, finish: U, error?: string) {
  return new Promise<T extends OnceEmitter<U, infer V> ? V : unknown[]>((resolve, reject) => {
    emitter.once(finish, (...args: any) => {
      resolve(args)
    })
    if (error) {
      emitter.once(error, (...args) => {
        reject(args)
      })
    }
  })
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
  until,
  createPattern,
}
