import { Module } from 'node:module'
import * as path from 'node:path'
import type { AddonInfo } from '@commas/types/addon'
import type { EffectScope } from '@vue/reactivity'
import { effectScope } from '@vue/reactivity'
import type { APIAddon, APIContext, CompatibleAPI } from '../types'
import * as app from './app'

declare module './app' {
  // eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
  export interface Events {
    [key: `unload:${string}`]: never[],
  }
}

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

function cloneAPI<T extends CompatibleAPI>(api: T, context: Omit<APIContext<T>, '$' | '_'>) {
  return new Proxy(api, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      return typeof value === 'object' && value !== null ? cloneAPIModule(value, { $: receiver, ...context }) : value
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
  const mod = { exports: exports ? { ...exports } : exports } as NodeJS.Module
  require.cache['commas:api'] = mod
  require.cache[app.isMainProcess() ? 'commas:api/main' : 'commas:api/renderer'] = mod
}

function addCommasExternalModules(modules: string[]) {
  addCommasModuleResolver()
  for (const id of modules) {
    const request = `commas:external/${id}`
    if (!(request in require.cache)) {
      require.cache[request] = { exports: require(id) } as NodeJS.Module
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

function loadAddon(addon: AddonInfo, api: CompatibleAPI) {
  if (loadedAddonContexts.some(item => item.addon.name === addon.name)) return
  // Reserved names
  if (addon.name === 'terminal') return
  // Create addon API
  const clonedAPI = cloneAPI(api, {
    __name__: addon.name,
    __entry__: addon.entry,
    __manifest__: addon.manifest,
  })
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
  loadedAddonContexts.unshift({ addon, scope })
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
