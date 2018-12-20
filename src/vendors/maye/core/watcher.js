export default {
  use(Maye) {
    Maye.watcher = this
  },
  $store: Object.create(null),
  $inspectors: [],
  $inspect(inspector) {
    if (typeof inspector !== 'function') return
    this.$inspectors.push(inspector)
  },
  $release(inspector) {
    const index = this.$inspectors.indexOf(inspector)
    if (index !== -1) {
      this.$inspectors.splice(index, 1)
    }
  },
  $collect(context) {
    const Maye = this.$maye.ref
    Maye.watcher.$inspectors.forEach(inspector => inspector(context))
  },
  $mutate(path, context) {
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
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
