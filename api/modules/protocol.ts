import { addRoute, removeRoute } from '../../main/lib/protocol'
import type { CommasContext } from '../types'

function noConflictAddRoute(this: CommasContext, name: string, handler: (url: URL) => void) {
  addRoute(name, handler)
  this.$.app.onCleanup(() => {
    removeRoute(name)
  })
}

export {
  noConflictAddRoute as addRoute,
}
