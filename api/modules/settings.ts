import { addSettingsSpecs, getSettings, getSettingsEvents, openSettingsFile, removeSettingsSpecs } from '../../main/lib/settings'
import type { SettingsSpec } from '../../typings/settings'
import type { CommasContext } from '../types'

function addSpecs(this: CommasContext, specs: SettingsSpec[]) {
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
