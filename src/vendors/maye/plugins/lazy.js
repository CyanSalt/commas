export default {
  use({state, accessor}) {
    state.lazy = this.$lazy
    accessor.lazy = this.$lazy
  },
  $lazy(path) {
    const {watcher} = this.$maye
    return {
      get: () => this.get(path),
      set: value => this.set(path, value),
      watch: callback => watcher.add(path, callback),
      unwatch: callback => watcher.remove(path, callback),
    }
  },
}
