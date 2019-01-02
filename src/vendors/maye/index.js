import path from './core/path'
import inspector from './core/inspector'
import state from './core/state'
import accessor from './core/accessor'
import watcher from './core/watcher'
import action from './core/action'

export default {
  use(Plugin, options) {
    let plugin
    if (typeof Plugin === 'function') {
      // eslint-disable-next-line new-cap
      plugin = new Plugin(this, options)
    } else {
      plugin = Object.create(Plugin)
      if (plugin.use) plugin.use(this, options)
    }
    if (this.booted) plugin.$maye = this
    return plugin
  },
  boot() {
    const Maye = Object.create(this)
    Maye.booted = true
    Maye.use(path)
    Maye.use(inspector)
    Maye.use(state)
    Maye.use(accessor)
    Maye.use(watcher)
    Maye.use(action)
    return Maye
  },
}
