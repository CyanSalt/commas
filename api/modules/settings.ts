import { addSettingsSpecs, removeSettingsSpecs, openSettingsFile } from '../../main/lib/settings'
import type { SettingsSpec } from '../../typings/settings'

function addSpecs(specs: SettingsSpec[]) {
  const validSpecs = specs.filter(spec => spec.key.startsWith(`${this.addon}.`))
  addSettingsSpecs(validSpecs)
  this.$.app.onCleanup(() => {
    removeSettingsSpecs(validSpecs)
  })
}

export {
  addSpecs,
  openSettingsFile as openFile,
}
