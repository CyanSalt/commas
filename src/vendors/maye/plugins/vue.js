export default {
  $maye: {
    use() {
      this.state = this.state.bind(this)
      this.acccessor = this.acccessor.bind(this)
      this.action = this.action.bind(this)
    }
  },
  state(path) {
    const Maye = this.$maye.ref
    return {
      get: () => Maye.state.get(path),
      set: value => Maye.state.set(path, value),
    }
  },
  acccessor(path) {
    const Maye = this.$maye.ref
    return {
      get: () => Maye.accessor.get(path),
      set: value => Maye.accessor.set(path, value),
    }
  },
  action(path) {
    const Maye = this.$maye.ref
    return payload => Maye.action.dispatch(path, payload)
  },
}
