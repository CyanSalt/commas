export default {
  $maye: {
    name: 'accessor',
  },
  $store: Object.create(null),
  $get(descriptor) {
    const Maye = this.$maye.ref
    return (0, descriptor.get)(Maye)
  },
  $set(descriptor, value) {
    const Maye = this.$maye.ref
    return (0, descriptor.set)(Maye, value)
  },
  get(path) {
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
    const descriptor = this.$store[key]
    if (descriptor && descriptor.get) {
      return this.$get(descriptor)
    }
    return void 0
  },
  set(path, value) {
    const Maye = this.$maye.ref
    path = Maye.path.resolve(path)
    const key = Maye.path.join(path)
    const descriptor = this.$store[key]
    if (descriptor && descriptor.set) {
      this.$set(descriptor, value)
      const old = this.$get(descriptor)
      if (descriptor.mutate) {
        Maye.watcher.$mutate(path, {path, old, value, by: 'accessor'})
      }
    }
  },
  define(path, descriptor) {
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
    if (!this.$store[key]) {
      this.$store[key] = descriptor
    }
  },
  exists(path) {
    const Maye = this.$maye.ref
    const key = Maye.path.locate(path)
    return Boolean(this.$store[key])
  },
}
