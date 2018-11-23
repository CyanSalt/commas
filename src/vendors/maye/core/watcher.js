export default {
  $maye: {
    name: 'watcher',
  },
  $store: Object.create(null),
  $mutate(path, context) {
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
    const watchers = this.$store[key]
    if (watchers) {
      watchers.forEach(watcher => watcher(Maye, context))
    }
    if (path.length > 1) {
      this.$mutate(path.slice(0, -1), context)
    }
  },
  add(path, callback) {
    if (typeof callback !== 'function') return
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
    if (!this.$store[key]) {
      this.$store[key] = [callback]
    } else {
      this.$store[key].push(callback)
    }
  },
  remove(path, callback) {
    if (typeof callback !== 'function') return
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
    if (this.$store[key]) {
      const index = this.$store[key].indexOf(callback)
      if (index !== -1) {
        this.$store[key].splice(index, 1)
      }
    }
  },
}
