import { EventEmitter } from 'node:events'
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

function getPath(name: Parameters<typeof app['getPath']>[0]) {
  return isMainProcess()
    ? app.getPath(name)
    : ipcRenderer.sendSync('get-path', name) as string
}

function getVersion() {
  return isMainProcess()
    ? app.getVersion()
    : ipcRenderer.sendSync('get-version') as string
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
  onCleanup,
  effect,
  onInvalidate,
}
