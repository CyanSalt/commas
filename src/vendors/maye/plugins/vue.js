export default {
  $maye: {
    use(Maye, Vue) {
      this.state = this.state.bind(this)
      this.accessor = this.accessor.bind(this)
      this.action = this.action.bind(this)
      this.$maye.vue = new Vue({data: {hooks: {}}})
    }
  },
  // `Vue.use()` can be called after `Maye.use()`
  install(Vue) {
    Vue.prototype.$maye = this.$maye.ref
  },
  watch(path) {
    const {$maye} = this
    const key = $maye.ref.path.locate(path)
    if ($maye.vue.hooks[key] === undefined) {
      $maye.vue.$set($maye.vue.hooks, key, true)
      $maye.ref.watcher.add(path, () => {
        $maye.vue.hooks[key] = !$maye.vue.hooks[key]
      })
      // eslint-disable-next-line no-unused-expressions
      $maye.vue.hooks[key]
    }
  },
  state(path) {
    const {$maye} = this
    return {
      get: () => {
        this.watch(path)
        return $maye.ref.state.get(path)
      },
      set: value => $maye.ref.state.set(path, value),
    }
  },
  accessor(path) {
    const {$maye} = this
    return {
      get: () => {
        this.watch(path)
        return $maye.ref.accessor.get(path)
      },
      set: value => $maye.ref.accessor.set(path, value),
    }
  },
  action(path) {
    const {$maye} = this
    return payload => $maye.ref.action.dispatch(path, payload)
  },
}
