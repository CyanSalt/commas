export default {
  use(mayeModule, options) {
    const {$maye} = mayeModule || {}
    if (!$maye || $maye.ref === this) return
    $maye.ref = this
    if ($maye.use) {
      $maye.use.call(mayeModule, this, options)
    }
    if ($maye.name) {
      this[$maye.name] = mayeModule
    }
  }
}
