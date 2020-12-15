const { addRoute, removeRoute } = require('../../main/lib/protocol')

function noConflictAddRoute(name, handler) {
  addRoute(name, handler)
  this.$.app.onCleanup(() => {
    removeRoute(name)
  })
}

module.exports = {
  addRoute: noConflictAddRoute,
}
