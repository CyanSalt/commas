const EventEmitter = require('events')

const events = new EventEmitter()

function isMainProcess() {
  return process.type === 'browser'
}

function cloneAPIMethod(method, context) {
  return new Proxy(method, {
    apply(target, thisArg, argArray) {
      return Reflect.apply(target, { _: thisArg, ...context }, argArray)
    },
  })
}

function cloneAPIModule(object, context) {
  return new Proxy(object, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      return value instanceof Object ? cloneAPIMethod(value, context) : value
    },
  })
}

function cloneAPI(api, name) {
  const proxy = new Proxy(api, {
    get(target, property, receiver) {
      const context = { $: proxy, addon: name }
      const value = Reflect.get(target, property, receiver)
      return value instanceof Object ? cloneAPIModule(value, context) : value
    },
  })
  return proxy
}

let loadedAddons = []
function loadAddon(name, api) {
  if (loadedAddons.includes(name)) return
  // TODO: support userland addons
  require(`../../addons/${name}`)(cloneAPI(api, name))
  loadedAddons.push(name)
}

function unloadAddon(name) {
  const index = loadedAddons.indexOf(name)
  if (index !== -1) {
    loadedAddons.splice(index, 1)
    events.emit(`unload:${name}`)
  }
}

function onInvalidate(callback) {
  events.once(`unload:${this.addon}`, callback)
}

module.exports = {
  events,
  isMainProcess,
  cloneAPI,
  loadAddon,
  unloadAddon,
  onInvalidate,
}
