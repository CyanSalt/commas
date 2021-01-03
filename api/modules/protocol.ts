import { addRoute, removeRoute } from '../../main/lib/protocol'

function noConflictAddRoute(name: string, handler: (url: URL) => void) {
  addRoute(name, handler)
  this.$.app.onCleanup(() => {
    removeRoute(name)
  })
}

export {
  noConflictAddRoute as addRoute,
}
