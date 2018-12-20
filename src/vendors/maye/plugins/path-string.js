export default {
  use(Maye) {
    Maye.path.$resolvers.push(this.$resolveString)
  },
  $resolveString(Maye, str) {
    if (typeof str === 'string' || str instanceof String) {
      return str.split(Maye.path.$separator)
    }
    return str
  },
}
