module.exports = function (commas) {

  if (!commas.app.isMainProcess()) {
    commas.workspace.addSlot(
      commas.module.require('internal/landscape/landscape-slot.vue').default
    )
  }

}
