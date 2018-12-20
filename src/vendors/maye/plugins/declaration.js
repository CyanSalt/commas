export default {
  use(Maye, options) {
    this.$apply(Maye, options)
  },
  $getReveiver({path}, prefix) {
    return path.Wrapper ? new path.Wrapper(prefix) : null
  },
  $apply(Maye, options, prefix = []) {
    if (options.states) {
      for (const key of Object.keys(options.states)) {
        const value = options.states[key]
        Maye.state.set([...prefix, key], value)
      }
    }
    if (options.accessors) {
      for (const key of Object.keys(options.accessors)) {
        let descriptor = options.accessors[key]
        if (typeof descriptor === 'function') {
          descriptor = {get: descriptor}
        }
        const receiver = this.$getReveiver(Maye, prefix)
        if (receiver && descriptor.get) {
          descriptor.get = descriptor.get.bind(receiver)
        }
        if (receiver && descriptor.set) {
          descriptor.set = descriptor.set.bind(receiver)
        }
        Maye.accessor.define([...prefix, key], descriptor)
      }
    }
    if (options.actions) {
      for (const key of Object.keys(options.actions)) {
        let action = options.actions[key]
        const receiver = this.$getReveiver(Maye, prefix)
        if (receiver) {
          action = action.bind(receiver)
        }
        Maye.action.define([...prefix, key], action)
      }
    }
    if (options.watchers) {
      for (const key of Object.keys(options.watchers)) {
        const watcher = options.watchers[key]
        Maye.watcher.add(key, watcher)
      }
    }
    if (options.children) {
      for (const key of Object.keys(options.children)) {
        const child = options.children[key]
        this.$apply(Maye, child, [...prefix, key])
      }
    }
  }
}
