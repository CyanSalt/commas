import { addSettingsSpecs, getSettings, getSettingsEvents, openSettingsFile, removeSettingsSpecs } from '../../main/lib/settings'
import type { SettingsSpec } from '../../typings/settings'

function addSpecs(specs: SettingsSpec[]) {
  const validSpecs = specs.filter(spec => spec.key.startsWith(`${this.__name__}.`))
  addSettingsSpecs(validSpecs)
  this.$.app.onCleanup(() => {
    removeSettingsSpecs(validSpecs)
  })
}

export {
  addSpecs,
  getSettings,
  getSettingsEvents as getEvents,
  openSettingsFile as openFile,
}
