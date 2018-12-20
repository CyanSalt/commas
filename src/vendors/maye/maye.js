export default {
  use(mayeModule, options) {
    if (!mayeModule) return
    const {$maye, use} = mayeModule
    if ($maye === this) return
    mayeModule.$maye = this
    if (use) use.call(mayeModule, this, options)
  },
}
