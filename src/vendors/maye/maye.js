export default {
  use(mayeModule, options) {
    if (!mayeModule) return
    const {$maye, use} = mayeModule
    if ($maye && $maye.ref === this) return
    mayeModule.$maye = {ref: this}
    if (use) use.call(mayeModule, this, options)
  },
}
