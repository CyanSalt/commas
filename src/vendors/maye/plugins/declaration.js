import pathWrapper from './path-wrapper'

export default {
  $maye: {
    use(Maye, options) {
      Maye.use(pathWrapper)
      this.$apply(Maye, options)
    }
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
        const receiver = new Maye.path.Wrapper(prefix)
        if (descriptor.get) {
          descriptor.get = descriptor.get.bind(receiver)
        }
        if (descriptor.set) {
          descriptor.set = descriptor.set.bind(receiver)
        }
        Maye.accessor.define([...prefix, key], descriptor)
      }
    }
    if (options.actions) {
      for (const key of Object.keys(options.actions)) {
        const action = options.actions[key]
        const receiver = new Maye.path.Wrapper(prefix)
        Maye.action.define([...prefix, key], action.bind(receiver))
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
