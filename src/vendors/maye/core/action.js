export default {
  use(Maye) {
    Maye.action = this
  },
  $store: Object.create(null),
  define(path, callback) {
    if (typeof callback !== 'function') return
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
    this.$store[key] = callback
  },
  dispatch(path, payload) {
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
    const callback = this.$store[key]
    if (callback) {
      return callback(Maye, payload)
    }
    return void 0
  },
}
