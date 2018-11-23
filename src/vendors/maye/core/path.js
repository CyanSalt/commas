export default {
  $maye: {
    name: 'path',
  },
  $separator: '.',
  $resolvers: [],
  resolve(path) {
    const Maye = this.$maye.ref
    if (path == null) {
      throw new Error('Cannot get state with undefined or null')
    }
    for (const resolver of this.$resolvers) {
      const result = resolver(Maye, path)
      if (result != null) path = result
    }
    return Array.prototype.slice.call(path).map(String)
  },
  join(path) {
    return path.join(this.$separator)
  },
  locate(path) {
    return this.resolve(path).join(this.$separator)
  },
}
