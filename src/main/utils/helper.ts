import * as childProcess from 'node:child_process'
import type { EventEmitter } from 'node:events'
import * as util from 'node:util'

const execa = util.promisify(childProcess.exec)

async function execute(command: string, options?: childProcess.ExecOptions) {
  const promise = execa(command, {
    encoding: 'utf8',
    ...options,
  })
  let code: number | null = null
  let signal: NodeJS.Signals | null = null
  promise.child.on('exit', (exitCode, exitSignal) => {
    code = exitCode
    signal = exitSignal
  })
  try {
    const result = await promise
    return Object.assign(result, {
      code: code as number | null,
      signal: signal as NodeJS.Signals | null,
    })
  } catch (err) {
    throw Object.assign(err, {
      code: code as number | null,
      signal: signal as NodeJS.Signals | null,
    })
  }
}

function until<T extends EventEmitter, U extends string>(emitter: T, finish: U, error?: string) {
  return new Promise<
    T extends EventEmitter<Record<U, infer V extends any[]>> ? V : (
    T extends {
      once(name: U, listener: (...args: infer V) => unknown): unknown,
    } ? V : unknown[]
    )
  >((resolve, reject) => {
        emitter.once(finish, (...args: any) => {
          resolve(args)
        })
        if (error) {
          emitter.once(error, rejection => {
            reject(rejection)
          })
        }
      })
}

function memoizeAsync<
  T extends (...args: unknown[]) => unknown,
  R extends ((...args: Parameters<T>) => unknown) | undefined,
>(func: T, resolver?: R) {
  const cache = new Map<R extends Function ? ReturnType<R> : Parameters<T>[0], ReturnType<T>>()
  const memoized = function (
    this: T extends (this: infer U, ...args: unknown[]) => unknown ? U : unknown,
    ...args: Parameters<T>
  ) {
    const key = resolver ? resolver.apply(this, args) : args[0]
    if (cache.has(key)) {
      return cache.get(key)!
    }
    const result: ReturnType<T> = func.apply(this, args)
    cache.set(key, result)
    // `Promise.resolve` will return the value itself if the value is already a promise
    Promise.resolve(result).catch(() => {
      if (cache.get(key) === result) {
        cache.delete(key)
      }
    })
    return result
  }
  memoized.cache = cache
  return memoized
}

export {
  execute,
  until,
  memoizeAsync,
}
