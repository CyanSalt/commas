import { markRaw, unref } from '@vue/reactivity'
import {
  downloadUserFile,
  openSettingsFile,
  openUserDirectory,
  useDefaultSettings,
  useSettings,
  useSettingsSpecs,
} from '../../src/main/lib/settings'
import type { SettingsSpec } from '../../typings/settings'
import type { MainAPIContext } from '../types'

function addSettingsSpecs(specs: SettingsSpec[]) {
  const currentSpecs = unref(useSettingsSpecs())
  currentSpecs.push(...specs.map(markRaw))
}

function removeSettingsSpecs(specs: SettingsSpec[]) {
  const specsRef = useSettingsSpecs()
  const currentSpecs = unref(specsRef)
  specsRef.value = currentSpecs.filter(item => specs.some(spec => spec.key !== item.key))
}

function addSpecs(this: MainAPIContext, specs: SettingsSpec[]) {
  const validSpecs = specs.filter(spec => spec.key.startsWith(`${this.__name__}.`))
  addSettingsSpecs(validSpecs)
  this.$.app.onCleanup(() => {
    removeSettingsSpecs(validSpecs)
  })
}

export * from '../shim'

export {
  addSpecs as addSettingsSpecs,
  useSettings,
  useDefaultSettings,
  openSettingsFile,
  openUserDirectory,
  downloadUserFile,
}
