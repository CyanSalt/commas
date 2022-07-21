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

export {
  execa,
  until,
  getStream,
}
