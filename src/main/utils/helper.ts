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

export {
  execa,
  until,
}
