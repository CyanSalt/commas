const { addSettingsSpecs } = require('../../main/lib/settings')

function addSpecs(specs) {
  return addSettingsSpecs(
    specs.filter(spec => spec.key && spec.key.startsWith(`${this.addon}.`))
  )
}
addSpecs.__withContext__ = true

module.exports = {
  addSpecs,
}
