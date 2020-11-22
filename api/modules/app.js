const EventEmitter = require('events')

const events = new EventEmitter()

function isMainProcess() {
  return process.type === 'browser'
}

function cloneAPI(api, name) {
  return new Proxy(api, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver)
      return value instanceof Object ? cloneAPI(value, name) : value
    },
    apply(target, thisArg, argArray) {
      const context = target.__withContext__ ? { addon: name } : thisArg
      return Reflect.apply(target, context, argArray)
    },
  })
}

let loadedAddons = []
function loadAddon(name, api) {
  if (loadedAddons.includes(name)) return
  // TODO: support userland addons
  require(`../../addons/${name}`)(cloneAPI(api, name))
  loadedAddons.push(name)
}

module.exports = {
  events,
  isMainProcess,
  cloneAPI,
  loadAddon,
}
