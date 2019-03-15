class Wrapper {
  constructor(prefix) {
    this.value = prefix
  }
  static unwrap(path) {
    return path instanceof Wrapper ? path.value : path
  }
}

export default {
  use({path}) {
    path.$resolvers.push(this.$resolveWrapper)
    path.Wrapper = Wrapper
  },
  $resolveWrapper(Maye, path) {
    if (!Array.isArray(path)) {
      return Wrapper.unwrap(path)
    }
    return path.flatMap(Wrapper.unwrap)
  },
}
