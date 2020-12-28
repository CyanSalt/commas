const EventEmitter = require('events')
const path = require('path')
const { app, ipcRenderer } = require('electron')

const events = new EventEmitter()

function isMainProcess() {
  return process.type === 'browser'
}

function isPackaged() {
  return isMainProcess()
    ? app.isPackaged
    : process.argv.some(arg => arg.startsWith('--app-path=') && arg.endsWith('app.asar'))
}

function getPath(name) {
  return isMainProcess()
    ? app.getPath(name)
    : ipcRenderer.sendSync('get-path', name)
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
  return new Proxy(api, {
    get(target, property, receiver) {
      const context = { $: receiver, addon: name }
      const value = Reflect.get(target, property, receiver)
      return value instanceof Object ? cloneAPIModule(value, context) : value
    },
  })
}

let loadedAddons = []
function loadAddon(name, api) {
  if (loadedAddons.includes(name)) return
  let addon
  try {
    addon = require(path.join(getPath('userData'), 'addons', name))
  } catch {
    addon = require(`../../addons/${name}`)
  }
  addon(cloneAPI(api, name))
  loadedAddons.push(name)
}

function unloadAddon(name) {
  const index = loadedAddons.indexOf(name)
  if (index !== -1) {
    loadedAddons.splice(index, 1)
    events.emit(`unload:${name}`)
  }
}

function unloadAddons() {
  loadedAddons.forEach(unloadAddon)
}

function onCleanup(callback) {
  events.once(`unload:${this.addon}`, callback)
}

module.exports = {
  events,
  isMainProcess,
  isPackaged,
  cloneAPI,
  loadAddon,
  unloadAddon,
  unloadAddons,
  onCleanup,
}
