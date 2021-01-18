import { EventEmitter } from 'events'
import * as path from 'path'
import { app, ipcRenderer } from 'electron'

const events = new EventEmitter()

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
      return value instanceof Object ? cloneAPIMethod(value, context) : value
    },
  })
}

function cloneAPI(api: Object, name: string) {
  return new Proxy(api, {
    get(target, property, receiver) {
      const context = { $: receiver, addon: name }
      const value = Reflect.get(target, property, receiver)
      return value instanceof Object ? cloneAPIModule(value, context) : value
    },
  })
}

const userDataPath = isPackaged()
  ? getPath('userData')
  : path.resolve(__dirname, '../../userData')

const loadedAddons: string[] = []
function loadAddon(name: string, api: object) {
  if (loadedAddons.includes(name)) return
  let addon
  if (name === 'custom.js') {
    try {
      addon = __non_webpack_require__(path.join(userDataPath, name))
    } catch {
      addon = () => {/* noop */}
    }
  } else {
    try {
      addon = __non_webpack_require__(path.join(userDataPath, 'addons', name))
    } catch {
      addon = isMainProcess()
        ? __non_webpack_require__(`../../addons/${name}`)
        : __non_webpack_require__(`../addons/${name}`)
    }
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

function onCleanup(callback: () => void) {
  events.once(`unload:${this.addon}`, callback)
}

export {
  events,
  isMainProcess,
  isPackaged,
  cloneAPI,
  loadAddon,
  unloadAddon,
  unloadAddons,
  onCleanup,
}
