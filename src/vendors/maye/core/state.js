export default {
  use(Maye) {
    this.$store = Object.create(null)
    Maye.state = this
  },
  get(path) {
    const Maye = this.$maye
    path = Maye.path.resolve(path)
    Maye.watcher.$collect({path, by: 'state'})
    const key = Maye.path.join(path)
    return this.$store[key]
  },
  update(path, mutation, returns) {
    const Maye = this.$maye
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
