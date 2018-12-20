export default {
  use(Maye) {
    this.$store = Object.create(null)
    Maye.action = this
  },
  define(path, callback) {
    if (typeof callback !== 'function') return
    const Maye = this.$maye
    const key = Maye.path.normalize(path)
    this.$store[key] = callback
  },
  dispatch(path, payload) {
    const Maye = this.$maye
    const key = Maye.path.normalize(path)
    const callback = this.$store[key]
    if (callback) {
      return callback(Maye, payload)
    }
    return void 0
  },
}
