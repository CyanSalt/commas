import { Module } from 'module'
import * as path from 'path'
import type { AddonInfo } from '../../src/typings/addon'
import type { APIAddon, APIContext, CompatableAPI } from '../types'
import * as app from './app'

function cloneAPIMethod<T>(method: Function, context: Omit<APIContext<T>, '_'>) {
  return new Proxy(method, {
    apply(target, thisArg, argArray) {
      return Reflect.apply(target, { _: thisArg, ...context }, argArray)
    },
  })
}

function cloneAPIModule<T>(object: object, context: Omit<APIContext<T>, '_'>) {
  return new Proxy(object, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      return typeof value === 'function' ? cloneAPIMethod(value, context) : value
    },
  })
}

function cloneAPI<T extends CompatableAPI>(api: T, name: string, entry: string) {
  return new Proxy(api, {
    get(target, property, receiver) {
      const context: Omit<APIContext<T>, '_'> = {
        $: receiver,
        __name__: name,
        __entry__: entry,
      }
      const value = Reflect.get(target, property, receiver)
      return typeof value === 'object' && value !== null ? cloneAPIModule(value, context) : value
    },
  })
}

function addCommasModuleResolver() {
  if (!Module['_resolveFilename']._original) {
    const resolveFilename = function (this: any, request: string, ...args) {
      if (request.startsWith('commas:')) return request
      return resolveFilename._original.call(this, request, ...args)
    }
    resolveFilename._original = Module['_resolveFilename']
    Module['_resolveFilename'] = resolveFilename
  }
}

function addCommasModule(exports) {
  addCommasModuleResolver()
  const mod = { exports: { ...exports } } as NodeModule
  require.cache['commas:api'] = mod
  require.cache[app.isMainProcess() ? 'commas:api/main' : 'commas:api/renderer'] = mod
}

function unsetCommasModule() {
  delete require.cache['commas:api']
  delete require.cache[app.isMainProcess() ? 'commas:api/main' : 'commas:api/renderer']
}

function addCommasExternalModules(modules: string[]) {
  addCommasModuleResolver()
  for (const id of modules) {
    const request = `commas:external/${id}`
    if (!(request in require.cache)) {
      require.cache[request] = { exports: require(id) } as NodeModule
    }
  }
}

const loadedAddons: AddonInfo[] = []
function loadAddon(addon: AddonInfo, api: CompatableAPI) {
  if (loadedAddons.some(item => item.name === addon.name)) return
  // Reserved names
  if (addon.name === 'terminal') return
  let processor: APIAddon
  if (addon.name === 'custom.js') {
    try {
      const userDataPath = app.isPackaged()
        ? path.join(app.getPath('userData'), 'User')
        : path.resolve('../../userdata')
      processor = require(path.join(userDataPath, addon.name))
    } catch {
      processor = () => {/* noop */}
    }
  } else {
    processor = require(addon.entry)
  }
  const clonedAPI = cloneAPI(api, addon.name, addon.entry)
  // Share reactivity system
  addCommasExternalModules(['@vue/reactivity', 'vue'])
  addCommasModule(clonedAPI)
  processor(clonedAPI)
  unsetCommasModule()
  loadedAddons.push(addon)
}

function unloadAddon(addon: AddonInfo) {
  const index = loadedAddons.findIndex(item => item.name === addon.name)
  if (index !== -1) {
    loadedAddons.splice(index, 1)
    app.events.emit(`unload:${addon.name}`)
  }
}

function unloadAddons() {
  loadedAddons.forEach(unloadAddon)
}

export * from '../shim'

export {
  cloneAPI,
  loadAddon,
  unloadAddon,
  unloadAddons,
}
