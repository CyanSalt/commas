class Wrapper {
  constructor(prefix) {
    this.value = prefix
  }
  static unwrap(path) {
    return path instanceof Wrapper ? path.value : path
  }
}

function flatMap(array, callback) {
  return [].concat(...array.map(callback))
}

export default {
  use(Maye) {
    Maye.path.$resolvers.push(this.$resolveWrapper)
    Maye.path.Wrapper = Wrapper
  },
  $resolveWrapper(Maye, path) {
    if (!Array.isArray(path)) {
      return Wrapper.unwrap(path)
    }
    return flatMap(path, Wrapper.unwrap)
  },
}
