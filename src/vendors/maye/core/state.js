export default {
  $maye: {
    name: 'state',
  },
  $store: Object.create(null),
  get(path) {
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
    return this.$store[key]
  },
  update(path, mutation, returns) {
    const Maye = this.$maye.ref
    path = Maye.path.resolve(path)
    const key = Maye.path.join(path)
    const old = this.$store[key]
    const result = mutation(old)
    let value = old
    if (returns) {
      value = result
      this.$store[key] = value
    }
    Maye.watcher.$mutate(path, {path, old, value, by: 'state'})
  },
  set(path, value) {
    this.update(path, () => value, true)
  },
}
