export default {
  $maye: {
    use(Maye) {
      // State shortcuts
      Maye.get = Maye.state.get.bind(Maye.state)
      Maye.set = Maye.state.set.bind(Maye.state)
      Maye.update = Maye.state.update.bind(Maye.state)
      // Accessor shortcuts
      Maye.aget = Maye.accessor.get.bind(Maye.accessor)
      Maye.aset = Maye.accessor.set.bind(Maye.accessor)
      // Action shortcuts
      Maye.dispatch = Maye.action.dispatch.bind(Maye.action)
    }
  },
}
