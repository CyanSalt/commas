export default {
  use(Maye, {Vue, install}) {
    this.$deps = new Vue({data: {hooks: {}}})
    Maye.$vue = this
    if (install) {
      Vue.prototype.$maye = Maye
    }
  },
  watch(path) {
    const {$maye, $deps} = this
    const key = $maye.path.normalize(path)
    if ($deps.hooks[key] === undefined) {
      $deps.$set($deps.hooks, key, true)
      $maye.watcher.add(path, () => {
        $deps.hooks[key] = !$deps.hooks[key]
      })
    }
    // eslint-disable-next-line no-unused-expressions
    $deps.hooks[key]
  },
}

export function state(path) {
  return {
    get() {
      this.$maye.$vue.watch(path)
      return this.$maye.state.get(path)
    },
    set(value) {
      return this.$maye.state.set(path, value)
    },
  }
}

export function accessor(path) {
  return {
    get() {
      this.$maye.$vue.watch(path)
      return this.$maye.accessor.get(path)
    },
    set(value) {
      return this.$maye.accessor.set(path, value)
    },
  }
}

export function action(path) {
  /** @this Vue */
  return function (payload) {
    this.$maye.action.dispatch(path, payload)
  }
}
