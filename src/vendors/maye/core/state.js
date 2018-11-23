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
  set(path, value) {
    const Maye = this.$maye.ref
    path = Maye.path.resolve(path)
    const key = Maye.path.join(path)
    const old = this.$store[key]
    this.$store[key] = value
    Maye.watcher.$mutate(path, {path, old, value, by: 'state'})
  },
}
