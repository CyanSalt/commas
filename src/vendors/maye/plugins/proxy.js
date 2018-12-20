export default {
  use(Maye) {
    Maye.proxy = this.$getProxy()
  },
  $identifier: '$',
  $getProxy(prefix = []) {
    const $this = this
    const Maye = this.$maye.ref
    return new Proxy({}, {
      get(target, key) {
        const path = [...prefix, key]
        if (key === $this.$identifier) {
          if (Maye.accessor.exists(path)) {
            return Maye.accessor.get(path)
          }
          return Maye.state.set(path)
        }
        return $this.$getProxy([...prefix, key])
      },
      set(target, key, value) {
        const path = [...prefix, key]
        if (Maye.accessor.exists(path)) {
          Maye.accessor.set(path, value)
        } else {
          Maye.state.set(path, value)
        }
        return true
      },
      apply(target, object, args) {
        return Maye.action.dispatch(prefix, args[0])
      },
      defineProperty(target, key, descriptor) {
        if (descriptor.get || descriptor.set) {
          Maye.accessor.define([...prefix, key], {
            get: descriptor.get,
            set: descriptor.set,
          })
        } else {
          Maye.accessor.define([...prefix, key], descriptor.value)
        }
        return true
      },
    })
  },
}
