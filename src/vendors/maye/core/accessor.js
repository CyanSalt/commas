export default {
  use(Maye) {
    this.$store = Object.create(null)
    Maye.accessor = this
  },
  $get(descriptor) {
    const Maye = this.$maye
    const deps = []
    const collect = ({path}) => {deps.push(path)}
    Maye.watcher.$inspect(collect)
    const value = (0, descriptor.get)(Maye)
    Maye.watcher.$release(collect)
    this.$memoize(descriptor, {value, deps})
    return value
  },
  $set(descriptor, value) {
    const Maye = this.$maye
    return (0, descriptor.set)(Maye, value)
  },
  $memoize(descriptor, {value, deps}) {
    const Maye = this.$maye
    if (!descriptor.$cache) {
      descriptor.$cache = {}
    } else {
      descriptor.$cache.deps.forEach(({path, watcher}) => {
        Maye.watcher.remove(path, watcher)
      })
    }
    descriptor.$cache.deps = deps.map(path => {
      const watcher = () => {
        const old = descriptor.$cache.value
        const newValue = this.$get(descriptor)
        Maye.watcher.$mutate(descriptor.$path, {
          path: descriptor.$path,
          old, value: newValue,
          by: 'accessor',
        })
      }
      Maye.watcher.add(path, watcher)
      return {path, watcher}
    })
    descriptor.$cache.value = value
  },
  get(path) {
    const Maye = this.$maye
    path = Maye.path.resolve(path)
    Maye.watcher.$collect({path, by: 'accessor'})
    const key = Maye.path.join(path)
    const descriptor = this.$store[key]
    if (descriptor) {
      if (descriptor.$cache) return descriptor.$cache.value
      if (descriptor.get) return this.$get(descriptor)
    }
    return void 0
  },
  set(path, value) {
    const Maye = this.$maye
    const key = Maye.path.normalize(path)
    const descriptor = this.$store[key]
    if (descriptor && descriptor.set) {
      this.$set(descriptor, value)
    }
  },
  define(path, descriptor) {
    const Maye = this.$maye
    path = Maye.path.resolve(path)
    descriptor.$path = path
    const key = Maye.path.join(path)
    if (!this.$store[key]) {
      this.$store[key] = descriptor
    }
  },
  exists(path) {
    const Maye = this.$maye
    const key = Maye.path.normalize(path)
    return Boolean(this.$store[key])
  },
}
