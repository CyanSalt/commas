import * as childProcess from 'child_process'
import type { EventEmitter } from 'events'
import type { Readable } from 'stream'
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

async function getStream(input: Readable): Promise<Buffer>
async function getStream(input: Readable, encoding: BufferEncoding): Promise<string>

async function getStream(input: Readable, encoding?: BufferEncoding) {
  const chunks: Buffer[] = []
  input.on('data', chunk => {
    chunks.push(chunk)
  })
  await until(input, 'end', 'error')
  const buffer = Buffer.concat(chunks)
  return encoding ? buffer.toString(encoding) : buffer
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
  execa,
  until,
  getStream,
  memoizeAsync,
}
