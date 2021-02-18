import { EventEmitter } from 'events'
import * as fs from 'fs'
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
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const context = { $: receiver, __name__: name }
      const value = Reflect.get(target, property, receiver)
      return value instanceof Object ? cloneAPIModule(value, context) : value
    },
  })
}

const userDataPath = isPackaged()
  ? getPath('userData')
  : path.resolve(__dirname, '../../userData')

interface AddonInfo {
  entry: string,
  manifest: any,
}

const discoveredAddons: Record<string, AddonInfo> = {}
async function discoverAddons() {
  const paths = [
    path.join(userDataPath, 'addons'),
    path.join(__dirname, isMainProcess() ? '../../addons' : '../addons'),
  ]
  for (const basePath of paths) {
    let dirents: fs.Dirent[] = []
    try {
      dirents = await fs.promises.readdir(basePath, { withFileTypes: true })
    } catch {
      // ignore
    }
    const directories = dirents
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name)
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      .filter(name => !discoveredAddons[name])
    for (const name of directories) {
      try {
        const manifest = __non_webpack_require__(path.join(basePath, name, 'commas.json'))
        const entry = path.join(basePath, name, 'index.js')
        discoveredAddons[name] = { entry, manifest }
      } catch {
        // continue
      }
    }
  }
}

function getAddonInfo(name: string) {
  return discoveredAddons[name]
}

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
    addon = __non_webpack_require__(discoveredAddons[name].entry)
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
  events.once(`unload:${this.__name__}`, callback)
}

export {
  events,
  isMainProcess,
  isPackaged,
  cloneAPI,
  discoverAddons,
  getAddonInfo,
  loadAddon,
  unloadAddon,
  unloadAddons,
  onCleanup,
}
