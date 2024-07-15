import { EventEmitter } from 'node:events'
import * as path from 'node:path'
import type { ReactiveEffectOptions } from '@vue/reactivity'
import { app } from 'electron'
import { ipcRenderer } from '@commas/electron-ipc'
import type { APIContext } from '../types'
import { watchBaseEffect } from './helper'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Events {}

type Listener<T extends keyof Events> = T extends keyof Events ? (
  Events[T] extends unknown[] ? (...args: Events[T]) => void : never
) : never

const events = new EventEmitter<Events>()
events.setMaxListeners(0)

function isMainProcess() {
  return process.type === 'browser'
}

function isPackaged() {
  return isMainProcess()
    ? app.isPackaged
    : process.argv.some(arg => arg.startsWith('--app-path=') && arg.endsWith('app.asar'))
}

function getPath(name?: Parameters<typeof app['getPath']>[0]) {
  return isMainProcess()
    ? (name ? app.getPath(name) : app.getAppPath())
    : ipcRenderer.sendSync('get-path', name)
}

function getVersion() {
  return isMainProcess()
    ? app.getVersion()
    : ipcRenderer.sendSync('get-version')
}

function getManifest(): Record<string, any> {
  return require(path.join(getPath(), 'package.json'))
}

function triggerError(err: Error) {
  if (isMainProcess()) {
    process.emit('uncaughtException', err)
  } else {
    console.error(err)
  }
}

function onCleanup(this: APIContext, callback: () => void) {
  events.once(`unload:${this.__name__}`, callback)
}

let currentContext: { invalidateFns: (() => void)[] } | undefined

function effect<T>(
  fn: (onInvalidate: (callback: () => void) => void) => T,
  options?: ReactiveEffectOptions,
) {
  return watchBaseEffect(onEffectInvalidate => {
    const previousContext = currentContext
    let invalidateFns: (() => void)[] = []
    currentContext = { invalidateFns }
    onEffectInvalidate(() => {
      invalidateFns.forEach(invalidate => {
        invalidate()
      })
    })
    const value = fn(callback => {
      invalidateFns.push(callback)
    })
    currentContext = previousContext
    return value
  }, options)
}

function onInvalidate(this: APIContext, callback: () => void) {
  if (currentContext) {
    currentContext.invalidateFns.push(callback)
  } else {
    onCleanup.call(this, callback)
  }
}

function on<T extends keyof Events>(
  this: APIContext,
  event: T,
  listener: Listener<T>,
) {
  events.on(event, listener)
  onInvalidate.call(this, () => {
    events.removeListener<T>(event, listener)
  })
}

export * from '../shim'

export {
  events,
  isMainProcess,
  isPackaged,
  getPath,
  getVersion,
  getManifest,
  triggerError,
  onCleanup,
  effect,
  onInvalidate,
  on,
}
