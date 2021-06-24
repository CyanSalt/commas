import { EventEmitter } from 'events'
import * as path from 'path'
import { app, ipcRenderer } from 'electron'
import type { CommasContext } from '../types'

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

function cloneAPIMethod(method: Function, context: {} | undefined) {
  return new Proxy(method, {
    apply(target, thisArg, argArray) {
      return Reflect.apply(target, { _: thisArg, ...context }, argArray)
    },
  })
}

function cloneAPIModule(object: object, context: {} | undefined) {
  return new Proxy(object, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      return typeof value === 'function' ? cloneAPIMethod(value, context) : value
    },
  })
}

function cloneAPI(api: Object, name: string) {
  return new Proxy(api, {
    get(target, property, receiver) {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const context = { $: receiver, __name__: name }
      const value = Reflect.get(target, property, receiver)
      return typeof value === 'object' && value !== null ? cloneAPIModule(value, context) : value
    },
  })
}

const userDataPath = isPackaged()
  ? getPath('userData')
  : path.resolve('../../userdata')

interface AddonInfo {
  entry: string,
  manifest: any,
  type: 'builtin' | 'user',
}

let preloadedAddons: Record<string, AddonInfo> = {}
function preloadAddons(addons: Record<string, AddonInfo>) {
  preloadedAddons = addons
}

const loadedAddons: string[] = []
function loadAddon(name: string, api: object) {
  // Reserved names
  if (loadedAddons.includes(name) || name === 'terminal') return
  let addon
  if (name === 'custom.js') {
    try {
      addon = require(path.join(userDataPath, name))
    } catch {
      addon = () => {/* noop */}
    }
  } else {
    addon = require(preloadedAddons[name].entry)
  }
  addon(cloneAPI(api, name))
  loadedAddons.push(name)
}

function unloadAddon(name: string) {
  const index = loadedAddons.indexOf(name)
  if (index !== -1) {
    loadedAddons.splice(index, 1)
    events.emit(`unload:${name}`)
  }
}

function unloadAddons() {
  loadedAddons.forEach(unloadAddon)
}

function onCleanup(this: CommasContext, callback: () => void) {
  events.once(`unload:${this.__name__}`, callback)
}

export {
  events,
  isMainProcess,
  isPackaged,
  cloneAPI,
  preloadAddons,
  loadAddon,
  unloadAddon,
  unloadAddons,
  onCleanup,
}
