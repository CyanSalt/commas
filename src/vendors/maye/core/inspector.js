export default {
  use(Maye) {
    this.$inspectors = []
    Maye.inspector = this
  },
  inspect(inspector) {
    if (typeof inspector !== 'function') return
    this.$inspectors.push(inspector)
  },
  release(inspector) {
    const index = this.$inspectors.indexOf(inspector)
    if (index !== -1) {
      this.$inspectors.splice(index, 1)
    }
  },
  collect(context) {
    this.$inspectors.forEach(inspector => inspector(context))
  },
  trace(processor, inspector) {
    this.inspect(inspector)
    const value = processor()
    this.release(inspector)
    return value
  },
}
