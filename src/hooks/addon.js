import hooks from './index'

export default {
  load(addon) {
    if (!addon || typeof addon.install !== 'function') {
      throw new Error('An addon must be an object with \'install\' method.')
    }
    addon.install(hooks)
  },
}
