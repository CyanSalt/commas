const { addKeyBinding, removeKeyBinding } = require('../../main/lib/keybinding')

function add(binding) {
  addKeyBinding(binding)
  this.$.app.onCleanup(() => {
    removeKeyBinding(binding)
  })
}

module.exports = {
  add,
}
