const EventEmitter = require('events')

const events = new EventEmitter()

function isMainProcess() {
  return process.type === 'browser'
}

let loadedAddons = []
function loadAddon(name, api) {
  if (loadedAddons.includes(name)) return
  // TODO: support userland addons
  require(`../../addons/${name}`)(api)
  loadedAddons.push(name)
}

module.exports = {
  events,
  isMainProcess,
  loadAddon,
}
