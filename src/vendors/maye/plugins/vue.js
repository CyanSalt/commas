export default {
  use(Maye, Vue) {
    this.state = this.state.bind(this)
    this.accessor = this.accessor.bind(this)
    this.action = this.action.bind(this)
    this.$vue = new Vue({data: {hooks: {}}})
  },
  // `Vue.use()` can be called after `Maye.use()`
  install(Vue) {
    Vue.prototype.$maye = this.$maye.ref
  },
  watch(path) {
    const {$maye, $vue} = this
    const key = $maye.ref.path.normalize(path)
    if ($vue.hooks[key] === undefined) {
      $vue.$set($vue.hooks, key, true)
      $maye.ref.watcher.add(path, () => {
        $vue.hooks[key] = !$vue.hooks[key]
      })
    }
    // eslint-disable-next-line no-unused-expressions
    $vue.hooks[key]
  },
  state(path) {
    return {
      get: () => {
        this.watch(path)
        return this.$maye.ref.state.get(path)
      },
      set: value => this.$maye.ref.state.set(path, value),
    }
  },
  accessor(path) {
    return {
      get: () => {
        this.watch(path)
        return this.$maye.ref.accessor.get(path)
      },
      set: value => this.$maye.ref.accessor.set(path, value),
    }
  },
  action(path) {
    return payload => this.$maye.ref.action.dispatch(path, payload)
  },
}
