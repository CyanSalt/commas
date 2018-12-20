export default {
  use(Maye) {
    Maye.state.lazy = this.$lazy
    Maye.accessor.lazy = this.$lazy
  },
  $lazy(path) {
    const Maye = this.$maye
    return {
      get: () => this.get(path),
      set: value => this.set(path, value),
      watch: callback => Maye.watcher.add(path, callback),
      unwatch: callback => Maye.watcher.remove(path, callback),
    }
  },
}
