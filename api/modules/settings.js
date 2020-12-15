const { addSettingsSpecs, removeSettingsSpecs, openSettingsFile } = require('../../main/lib/settings')

function addSpecs(specs) {
  const validSpecs = specs.filter(spec => spec.key && spec.key.startsWith(`${this.addon}.`))
  addSettingsSpecs(validSpecs)
  this.$.app.onCleanup(() => {
    removeSettingsSpecs(validSpecs)
  })
}

module.exports = {
  addSpecs,
  openFile: openSettingsFile,
}
