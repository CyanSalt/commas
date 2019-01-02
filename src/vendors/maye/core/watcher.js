export default {
  use(Maye) {
    this.$store = Object.create(null)
    Maye.watcher = this
  },
  $mutate(path, context) {
    const Maye = this.$maye
    const key = Maye.path.normalize(path)
    const watchers = this.$store[key]
    if (watchers) {
      // a watcher may remove itself and change the index of watchers
      [...watchers].forEach(watcher => watcher(Maye, context))
    }
    if (path.length > 1) {
      this.$mutate(path.slice(0, -1), context)
    }
  },
  add(path, callback) {
    if (typeof callback !== 'function') return
    const Maye = this.$maye
    const key = Maye.path.normalize(path)
    if (!this.$store[key]) {
      this.$store[key] = [callback]
    } else {
      this.$store[key].push(callback)
    }
  },
  remove(path, callback) {
    if (typeof callback !== 'function') return
    const Maye = this.$maye
    const key = Maye.path.normalize(path)
    if (this.$store[key]) {
      const index = this.$store[key].indexOf(callback)
      if (index !== -1) {
        this.$store[key].splice(index, 1)
      }
    }
  },
}
