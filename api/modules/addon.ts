import { Module } from 'node:module'
import * as path from 'node:path'
import type { EffectScope } from '@vue/reactivity'
import { effectScope } from '@vue/reactivity'
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
  const mod = { exports: exports ? { ...exports } : exports } as NodeModule
  require.cache['commas:api'] = mod
  require.cache[app.isMainProcess() ? 'commas:api/main' : 'commas:api/renderer'] = mod
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

interface AddonContext {
  addon: AddonInfo,
  scope: EffectScope,
}

const loadedAddonContexts: AddonContext[] = []

function loadAddonEntry(addon: AddonInfo): APIAddon {
  if (addon.name === 'custom.js') {
    try {
      const userDataPath = app.isPackaged()
        ? path.join(app.getPath('userData'), 'User')
        : path.join(app.getPath(), 'userdata')
      return require(path.join(userDataPath, addon.name))
    } catch {
      return () => {/* noop */}
    }
  }
  return require(addon.entry)
}

function loadAddon(addon: AddonInfo, api: CompatableAPI) {
  if (loadedAddonContexts.some(item => item.addon.name === addon.name)) return
  // Reserved names
  if (addon.name === 'terminal') return
  // Create addon API
  const clonedAPI = cloneAPI(api, addon.name, addon.entry)
  // Share reactivity system
  addCommasExternalModules(['@vue/reactivity', 'vue'])
  addCommasModule(clonedAPI)
  // Reactivity scope
  const scope = effectScope()
  scope.run(() => {
    try {
      const processor = loadAddonEntry(addon)
      processor(clonedAPI)
    } catch (err) {
      app.triggerError(err)
    }
  })
  addCommasModule(undefined)
  loadedAddonContexts.push({ addon, scope })
}

function unloadAddon(addon: AddonInfo) {
  const index = loadedAddonContexts.findIndex(item => item.addon.name === addon.name)
  if (index !== -1) {
    const context = loadedAddonContexts[index]
    loadedAddonContexts.splice(index, 1)
    app.events.emit(`unload:${addon.name}`)
    context.scope.stop()
  }
}

function unloadAddons() {
  loadedAddonContexts.forEach(context => {
    unloadAddon(context.addon)
  })
}

export * from '../shim'

export {
  cloneAPI,
  loadAddon,
  unloadAddon,
  unloadAddons,
}
