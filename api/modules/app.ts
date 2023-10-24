import { EventEmitter } from 'node:events'
import * as path from 'node:path'
import type { ReactiveEffectOptions } from '@vue/reactivity'
import { app, ipcRenderer } from 'electron'
import type { APIContext } from '../types'
import { watchBaseEffect } from './helper'

const events = new EventEmitter()
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
    : ipcRenderer.sendSync('get-path', name) as string
}

function getVersion() {
  return isMainProcess()
    ? app.getVersion()
    : ipcRenderer.sendSync('get-version') as string
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
}
