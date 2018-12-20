export default {
  use(Maye, {Vue, install}) {
    this.state = this.state.bind(this)
    this.accessor = this.accessor.bind(this)
    this.action = this.action.bind(this)
    this.$vue = new Vue({data: {hooks: {}}})
    if (install) Vue.prototype.$maye = Maye
  },
  watch(path) {
    const {$maye, $vue} = this
    const key = $maye.path.normalize(path)
    if ($vue.hooks[key] === undefined) {
      $vue.$set($vue.hooks, key, true)
      $maye.watcher.add(path, () => {
        $vue.hooks[key] = !$vue.hooks[key]
      })
    }
    // eslint-disable-next-line no-unused-expressions
    $vue.hooks[key]
  },
  state(path) {
    const $this = this
    return {
      get: () => {
        $this.watch(path)
        return $this.$maye.state.get(path)
      },
      set: value => $this.$maye.state.set(path, value),
    }
  },
  accessor(path) {
    const $this = this
    return {
      get: () => {
        $this.watch(path)
        return $this.$maye.accessor.get(path)
      },
      set: value => $this.$maye.accessor.set(path, value),
    }
  },
  action(path) {
    const $this = this
    return payload => $this.$maye.action.dispatch(path, payload)
  },
}
