export default {
  use({path}) {
    path.$resolvers.push(this.$resolveString)
  },
  $resolveString({path}, str) {
    if (typeof str === 'string' || str instanceof String) {
      return str.split(path.$separator)
    }
    return str
  },
}
